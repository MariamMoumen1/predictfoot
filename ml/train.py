import io
import json
import urllib.request
from collections import defaultdict, deque

import numpy as np
import pandas as pd

SEASONS = ["2122", "2223", "2324", "2425", "2526", "2627"]
LEAGUES = ["E0"]  # Premier League
HOME_ADV = 60  # identique dans app.py
K = 20
CLASSES = ["A", "D", "H"]  # extérieur, nul, domicile


def download():
    frames = []
    for s in SEASONS:
        for lg in LEAGUES:
            url = f"https://www.football-data.co.uk/mmz4281/{s}/{lg}.csv"
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
                raw = urllib.request.urlopen(req, timeout=30).read()
                df = pd.read_csv(io.BytesIO(raw), encoding="latin-1", on_bad_lines="skip")
                df = df[["Date", "HomeTeam", "AwayTeam", "FTHG", "FTAG", "FTR"]].dropna()
                frames.append(df)
                print("OK  ", s, lg, len(df))
            except Exception as e:
                print("SKIP", s, lg, e)
    if not frames:
        raise SystemExit("Aucune donnee telechargee. Verifie ta connexion internet.")
    data = pd.concat(frames)
    data["Date"] = pd.to_datetime(data["Date"], dayfirst=True, format="mixed", errors="coerce")
    return data.dropna(subset=["Date"]).sort_values("Date").reset_index(drop=True)


def features(elo, form, gf, ga, h, a):
    return [
        elo[h] + HOME_ADV - elo[a],
        np.mean(form[h]), np.mean(form[a]),
        np.mean(gf[h]), np.mean(ga[h]),
        np.mean(gf[a]), np.mean(ga[a]),
    ]


def softmax(z):
    z = z - z.max(axis=1, keepdims=True)
    e = np.exp(z)
    return e / e.sum(axis=1, keepdims=True)


def fit(X, y, n_iter=5000, lr=0.1, l2=0.01):
    """Regression logistique multinomiale (descente de gradient + regularisation L2)."""
    n, d = X.shape
    W, b = np.zeros((d, 3)), np.zeros(3)
    Y = np.eye(3)[y]
    for _ in range(n_iter):
        G = (softmax(X @ W + b) - Y) / n
        W -= lr * (X.T @ G + l2 * W)
        b -= lr * G.sum(axis=0)
    return W, b


data = download()
print(f"\n{len(data)} matchs au total\n")

elo = defaultdict(lambda: 1500.0)
form = defaultdict(lambda: deque(maxlen=5))
gf = defaultdict(lambda: deque(maxlen=5))
ga = defaultdict(lambda: deque(maxlen=5))

X, y = [], []
for r in data.itertuples():
    h, a = r.HomeTeam, r.AwayTeam
    if len(form[h]) >= 3 and len(form[a]) >= 3:
        X.append(features(elo, form, gf, ga, h, a))
        y.append(CLASSES.index(r.FTR))

    expected = 1 / (1 + 10 ** (-(elo[h] + HOME_ADV - elo[a]) / 400))
    actual = 1.0 if r.FTR == "H" else 0.5 if r.FTR == "D" else 0.0
    elo[h] += K * (actual - expected)
    elo[a] -= K * (actual - expected)

    form[h].append(3 if r.FTR == "H" else 1 if r.FTR == "D" else 0)
    form[a].append(3 if r.FTR == "A" else 1 if r.FTR == "D" else 0)
    gf[h].append(r.FTHG); ga[h].append(r.FTAG)
    gf[a].append(r.FTAG); ga[a].append(r.FTHG)

X, y = np.array(X, dtype=float), np.array(y)

# Evaluation : decoupage chronologique (on teste sur le "futur")
split = int(len(X) * 0.8)
mu, sd = X[:split].mean(axis=0), X[:split].std(axis=0) + 1e-9
W, b = fit((X[:split] - mu) / sd, y[:split])
P = softmax(((X[split:] - mu) / sd) @ W + b)
acc = float(np.mean(P.argmax(axis=1) == y[split:]))
logloss = float(-np.mean(np.log(P[np.arange(len(P)), y[split:]] + 1e-12)))
base = float(np.mean(y[split:] == CLASSES.index("H")))
print(f"Exactitude du modele    : {acc:.3f}")
print(f"Toujours 'domicile'     : {base:.3f}  (reference a battre)")
print(f"Log-loss                : {logloss:.3f}\n")

# Modele final : entraine sur toutes les donnees
mu, sd = X.mean(axis=0), X.std(axis=0) + 1e-9
W, b = fit((X - mu) / sd, y)
with open("model.json", "w", encoding="utf-8") as f:
    json.dump({"classes": CLASSES, "mean": mu.tolist(), "std": sd.tolist(), "W": W.tolist(), "b": b.tolist()}, f)

stats = {
    t: {"elo": elo[t], "form": float(np.mean(form[t])), "gf": float(np.mean(gf[t])), "ga": float(np.mean(ga[t]))}
    for t in form
    if len(form[t]) >= 3
}
with open("team_stats.json", "w", encoding="utf-8") as f:
    json.dump(stats, f, ensure_ascii=False, indent=1)
print(f"Sauvegarde : model.json + team_stats.json ({len(stats)} equipes)")
