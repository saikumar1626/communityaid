from datetime import datetime

NEEDS = []
VOLUNTEERS = [
    {"id": "v1", "name": "Ravi Kumar", "skills": ["food", "shelter"], "location": "Kakinada", "available": True},
    {"id": "v2", "name": "Priya Sharma", "skills": ["medical", "education"], "location": "Kakinada", "available": True},
    {"id": "v3", "name": "Suresh Babu", "skills": ["food", "education"], "location": "Rajahmundry", "available": True},
    {"id": "v4", "name": "Anita Reddy", "skills": ["shelter", "medical"], "location": "Kakinada", "available": True},
]
MATCHES = []

def analyse_need(title: str, description: str, location: str, urgency_score: int, category: str) -> dict:
    """Saves an analysed community need with urgency score and category."""
    need = {
        "id": f"need_{len(NEEDS)+1}",
        "title": title,
        "description": description,
        "location": location,
        "urgency_score": urgency_score,
        "category": category,
        "status": "unmatched",
        "created_at": datetime.now().isoformat()
    }
    NEEDS.append(need)
    return {
        "status": "success",
        "message": f"Need recorded with urgency {urgency_score}/10",
        "category": category,
        "need_id": need["id"]
    }

def get_volunteers() -> dict:
    """Fetches all available volunteers."""
    available = [v for v in VOLUNTEERS if v["available"]]
    return {
        "status": "success",
        "volunteers": available,
        "count": len(available)
    }

def match_volunteer(need_title: str, volunteer_name: str, volunteer_id: str, reason: str) -> dict:
    """Records a volunteer match for a specific need."""
    match = {
        "need_title": need_title,
        "volunteer_name": volunteer_name,
        "volunteer_id": volunteer_id,
        "match_reason": reason,
        "status": "assigned",
        "matched_at": datetime.now().isoformat()
    }
    MATCHES.append(match)
    for v in VOLUNTEERS:
        if v["id"] == volunteer_id:
            v["available"] = False
    for n in NEEDS:
        if n["title"] == need_title:
            n["status"] = "matched"
    return {
        "status": "success",
        "message": f"{volunteer_name} matched to '{need_title}'"
    }

def get_all_needs() -> dict:
    """Fetches all community needs sorted by urgency."""
    sorted_needs = sorted(NEEDS, key=lambda x: x["urgency_score"], reverse=True)
    return {"status": "success", "needs": sorted_needs}

def get_stats() -> dict:
    """Returns summary statistics about needs and volunteer coverage."""
    total = len(NEEDS)
    matched = len([n for n in NEEDS if n["status"] == "matched"])
    available_vols = len([v for v in VOLUNTEERS if v["available"]])
    return {
        "status": "success",
        "total_needs": total,
        "matched_needs": matched,
        "unmatched_needs": total - matched,
        "available_volunteers": available_vols,
        "total_matches": len(MATCHES),
        "coverage_rate": f"{round((matched/total)*100)}%" if total else "0%"
    }