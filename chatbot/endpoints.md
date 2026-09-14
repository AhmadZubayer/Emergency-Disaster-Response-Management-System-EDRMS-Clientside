# EDRMS Public Endpoints & Navigation Directory

This document lists the available public GET endpoints and corresponding frontend navigation URLs for the Emergency & Disaster Response Management System (EDRMS).

---

## 1. Donations & Relief Aid
- **Public API GET Endpoint**: `GET /donations/campaigns`
- **Frontend Page URL**: `/donations`
- **Description**: Browse active disaster donation campaigns, contribute funds via Stripe, or apply for aid/relief support.
- **Specific Campaign Detail**: `/donations/[id]`
- **When to Use**: When users ask about available donations, financial relief, aid campaigns, how to receive funds, or how to donate.

---

## 2. Disasters & Alerts
- **Public API GET Endpoint**: `GET /disaster`
- **Frontend Page URL**: `/disaster`
- **Description**: Real-time tracking of ongoing disasters (floods, cyclones, earthquakes, fires), risk levels, affected divisions/districts, and live weather alerts.
- **Specific Disaster Detail**: `/disaster/[id]`
- **When to Use**: When users ask about current natural disasters, affected areas, severity levels, or disaster updates.

---

## 3. Rescue Requests & Emergency Help
- **Public API GET Endpoint**: `GET /rescue-requests`
- **Frontend Page URL**: `/rescue-requests`
- **Description**: Live feed of active rescue requests, urgency levels (Critical, High, Medium), victim location, and rescue statuses.
- **Submit Rescue Request Page**: `/rescue-requests` (with the "Request Rescue" button)
- **When to Use**: When users ask for emergency evacuation, rescue status in an area, or want to submit a rescue SOS for stranded people.

---

## 4. Missing Persons
- **Public API GET Endpoint**: `GET /missing-persons`
- **Frontend Page URL**: `/missing-persons`
- **Description**: Directory of reported missing individuals during crises, photos, physical descriptions, last-seen locations, and contact points.
- **Report Missing Person**: `/missing-persons` (Click "Report Missing Person")
- **When to Use**: When users ask how to report or search for lost family members or friends.

---

## 5. Community Forum & Updates
- **Public API GET Endpoint**: `GET /community-posts`
- **Frontend Page URL**: `/community`
- **Description**: Community bulletin board where citizens and volunteers post real-time ground reports, warnings, resource needs, and situation updates.
- **When to Use**: When users ask for local community discussions, field observations, or ground-level updates.

---

## 6. Shelters & Safe Zones
- **Public API GET Endpoint**: `GET /shelter`
- **Frontend Page URL**: `/shelter`
- **Description**: Verified relief shelters, safety centers, flood centers, cyclone shelters, capacity, and facilities.
- **When to Use**: When users ask where the nearest safe shelter or evacuation center is located.

---

## 7. Volunteer Registration & Relief Organizations
- **Volunteer Signup URL**: `/volunteer-registration-form`
- **Relief Organization Signup URL**: `/signup-as-relief-org`
- **When to Use**: When users ask how to volunteer, join rescue teams, or register an NGO/relief organization.

