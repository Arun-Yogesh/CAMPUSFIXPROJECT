from .models import Complaint

CRITICAL_KEYWORDS = [
    'spark', 'fire', 'electric shock', 'exposed wire', 'dangerous',
    'emergency', 'smoke', 'gas leak', 'blast', 'short circuit',
    'hazard', 'falling ceiling', 'shock'
]

HIGH_PRIORITY_KEYWORDS = [
    'broken glass', 'water flood', 'overflow', 'blackout', 'no power',
    'projector burnt', 'locked inside', 'server down'
]


def detect_priority_suggestion(title: str = '', description: str = '') -> dict:
    """
    Heuristic rule-based priority detector.
    Analyzes title and description for hazard keywords.
    """
    text = f"{title} {description}".lower()
    
    matched_critical = [kw for kw in CRITICAL_KEYWORDS if kw in text]
    if matched_critical:
        return {
            'suggested_priority': 'Critical',
            'confidence': 'High',
            'reasons': [f"Detected safety hazard keyword: '{kw}'" for kw in matched_critical[:3]],
            'is_emergency': True
        }

    matched_high = [kw for kw in HIGH_PRIORITY_KEYWORDS if kw in text]
    if matched_high:
        return {
            'suggested_priority': 'High',
            'confidence': 'Medium',
            'reasons': [f"Detected urgent maintenance keyword: '{kw}'" for kw in matched_high[:3]],
            'is_emergency': False
        }

    return {
        'suggested_priority': 'Medium',
        'confidence': 'Normal',
        'reasons': ["No emergency hazards detected. Standard priority applied."],
        'is_emergency': False
    }


def find_potential_duplicates(category: str, location: str, title: str = '', exclude_id=None):
    """
    Finds existing unresolved complaints matching same category & location or similar title.
    """
    if not category or not location:
        return []

    qs = Complaint.objects.exclude(status__in=['Resolved', 'Rejected'])
    if exclude_id:
        qs = qs.exclude(id=exclude_id)

    # Clean location for matching
    loc_clean = location.strip().lower()

    matches = []
    for c in qs:
        score = 0
        # Exact/partial category match
        if c.category.lower() == category.lower():
            score += 2
        # Location match
        c_loc = c.location.strip().lower()
        if c_loc == loc_clean or (len(loc_clean) > 3 and loc_clean in c_loc) or (len(c_loc) > 3 and c_loc in loc_clean):
            score += 3
        # Title match
        if title:
            words = [w for w in title.lower().split() if len(w) > 3]
            c_title_words = c.complaint_title.lower().split()
            common = set(words).intersection(set(c_title_words))
            if common:
                score += len(common)

        if score >= 4:
            matches.append({
                'id': c.id,
                'complaint_title': c.complaint_title,
                'category': c.category,
                'location': c.location,
                'status': c.status,
                'priority': c.priority,
                'created_at': c.created_at.strftime('%Y-%m-%d %H:%M')
            })

    return matches[:5]
