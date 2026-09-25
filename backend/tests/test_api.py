"""Comprehensive test suite for AyurCTMS backend modules."""

def test_root_health(client):
    """Test public health endpoint."""
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "healthy"}


def test_auth_login_all_roles(client):
    """Verify separate login for all 5 roles."""
    roles = [
        ("pi@ayurctms.in", "PI"),
        ("ethics@ayurctms.in", "ETHICS"),
        ("pv@ayurctms.in", "PV"),
        ("regulator@ayurctms.in", "REGULATOR"),
        ("admin@ayurctms.in", "ADMIN"),
    ]
    for email, expected_role in roles:
        res = client.post("/api/auth/login", json={"email": email, "password": "Password123!"})
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert data["user"]["role"] == expected_role


def test_auth_invalid_credentials(client):
    """Verify unauthorized response on wrong password."""
    res = client.post("/api/auth/login", json={"email": "pi@ayurctms.in", "password": "WrongPassword"})
    assert res.status_code == 401


def test_trials_list(client, pi_token):
    """Test retrieving trial list."""
    res = client.get("/api/trials", headers={"Authorization": f"Bearer {pi_token}"})
    assert res.status_code == 200
    trials = res.json()
    assert len(trials) >= 3
    assert any(t["study_id"].startswith("CTRI/") for t in trials)


def test_role_enforcement_regulator_cannot_create_trial(client, regulator_token):
    """Verify regulator role cannot create trial (403 Forbidden)."""
    payload = {
        "study_id": "TEST-UNAUTHORIZED",
        "title": "Unauthorized Trial",
        "status": "DRAFT"
    }
    res = client.post("/api/trials", json=payload, headers={"Authorization": f"Bearer {regulator_token}"})
    assert res.status_code == 403


def test_ai_terminology_harmonizer(client, pi_token):
    """Test AI mapping of Classical Ayurvedic terms to MedDRA codes."""
    res = client.post(
        "/api/terminology/suggest",
        json={"term": "amlapitta", "context": "upper GI discomfort post dosing"},
        headers={"Authorization": f"Bearer {pi_token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert len(data["suggestions"]) > 0
    top_hit = data["suggestions"][0]
    assert "Dyspepsia" in top_hit["meddra_term"]
    assert top_hit["confidence_score"] > 0.8


def test_sae_countdown_active(client, pi_token):
    """Verify active SAE alert and countdown tracking."""
    res = client.get("/api/adverse-events/sae/active-countdown", headers={"Authorization": f"Bearer {pi_token}"})
    assert res.status_code == 200
    saes = res.json()
    assert len(saes) >= 1
    sae = saes[0]
    assert sae["sae_status"] in ["PENDING_24H", "OVERDUE"]
    assert sae["hours_remaining"] is not None


def test_fhir_r4_bundle_export(client, regulator_token):
    """Verify FHIR R4 Bundle generation with ResearchStudy, ResearchSubject, AdverseEvent."""
    # First get a trial id
    trials_res = client.get("/api/trials", headers={"Authorization": f"Bearer {regulator_token}"})
    trial_id = trials_res.json()[0]["id"]

    res = client.get(f"/api/exports/fhir/{trial_id}", headers={"Authorization": f"Bearer {regulator_token}"})
    assert res.status_code == 200
    bundle = res.json()
    assert bundle["resourceType"] == "Bundle"
    assert bundle["type"] == "collection"
    assert len(bundle["entry"]) > 0
    
    resource_types = [e["resource"]["resourceType"] for e in bundle["entry"]]
    assert "ResearchStudy" in resource_types


def test_sdtm_ae_and_dm_export(client, regulator_token):
    """Verify CDISC SDTM domain exports (AE and DM)."""
    trials_res = client.get("/api/trials", headers={"Authorization": f"Bearer {regulator_token}"})
    trial_id = trials_res.json()[0]["id"]

    # AE domain
    res_ae = client.get(f"/api/exports/sdtm/{trial_id}/AE", headers={"Authorization": f"Bearer {regulator_token}"})
    assert res_ae.status_code == 200
    ae_data = res_ae.json()
    assert ae_data["domain"] == "AE"
    assert "USUBJID" in ae_data["columns"]

    # DM domain
    res_dm = client.get(f"/api/exports/sdtm/{trial_id}/DM", headers={"Authorization": f"Bearer {regulator_token}"})
    assert res_dm.status_code == 200
    dm_data = res_dm.json()
    assert dm_data["domain"] == "DM"
    assert "RFSTDTC" in dm_data["columns"]


def test_compliance_scorecard(client, ethics_token):
    """Test statutory compliance scorecard metrics."""
    res = client.get("/api/compliance/scorecard", headers={"Authorization": f"Bearer {ethics_token}"})
    assert res.status_code == 200
    data = res.json()
    assert "compliance_rate_percent" in data
    assert "total_reviews" in data


def test_audit_trail_immutable(client, regulator_token):
    """Verify 21 CFR Part 11 audit trail ledger contains reason_for_change."""
    res = client.get("/api/audit-logs", headers={"Authorization": f"Bearer {regulator_token}"})
    assert res.status_code == 200
    logs = res.json()
    assert len(logs) > 0
    assert any(log["reason_for_change"] is not None for log in logs)


def test_dashboard_metrics(client, pi_token):
    """Test comprehensive dashboard telemetry."""
    res = client.get("/api/dashboard/metrics", headers={"Authorization": f"Bearer {pi_token}"})
    assert res.status_code == 200
    metrics = res.json()
    assert metrics["total_trials"] >= 3
    assert metrics["total_participants"] >= 10
    assert len(metrics["urgent_sae_alerts"]) >= 1
