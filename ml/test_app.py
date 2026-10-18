from app import predict


def test_probabilities_sum_to_100():
    r = predict("Man City", "Arsenal")
    assert r is not None
    assert r["home"] + r["draw"] + r["away"] == 100


def test_unknown_team_returns_none():
    assert predict("Equipe Inconnue", "Arsenal") is None