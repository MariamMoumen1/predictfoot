import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import numpy as np

HOME_ADV = 60  # identique a train.py

with open("model.json", encoding="utf-8") as f:
    M = json.load(f)
with open("team_stats.json", encoding="utf-8") as f:
    STATS = json.load(f)

MEAN, STD = np.array(M["mean"]), np.array(M["std"])
W, B, CLASSES = np.array(M["W"]), np.array(M["b"]), M["classes"]


def predict(home: str, away: str):
    if home not in STATS or away not in STATS:
        return None
    h, a = STATS[home], STATS[away]
    x = np.array([h["elo"] + HOME_ADV - a["elo"], h["form"], a["form"], h["gf"], h["ga"], a["gf"], a["ga"]])
    z = ((x - MEAN) / STD) @ W + B
    p = np.exp(z - z.max())
    p /= p.sum()
    pr = dict(zip(CLASSES, p))
    hm, aw = round(pr["H"] * 100), round(pr["A"] * 100)
    return {"home": hm, "draw": 100 - hm - aw, "away": aw, "model": "ML v1 (regression logistique)"}


class Handler(BaseHTTPRequestHandler):
    def _send(self, code, body):
        data = json.dumps(body).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path == "/health":
            self._send(200, {"ok": True, "teams": len(STATS)})
        elif self.path == "/teams":
            self._send(200, sorted(STATS.keys()))
        else:
            self._send(404, {"error": "not found"})

    def do_POST(self):
        if self.path != "/predict":
            return self._send(404, {"error": "not found"})
        try:
            body = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))))
            res = predict(body["home"], body["away"])
        except Exception as e:
            return self._send(400, {"error": str(e)})
        if res is None:
            return self._send(404, {"error": "Equipe inconnue"})
        self._send(200, res)


if __name__ == "__main__":
    print("API ML sur http://localhost:8010  (Ctrl+C pour arreter)")
    ThreadingHTTPServer(("0.0.0.0", int(os.environ.get("PORT", 8010))), Handler).serve_forever()

