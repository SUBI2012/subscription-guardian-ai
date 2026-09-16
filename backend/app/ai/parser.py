import re
from datetime import datetime

import spacy


# ---------------------------------------------------------
# 1. Create a blank English NLP pipeline
# ---------------------------------------------------------

nlp = spacy.blank("en")


# ---------------------------------------------------------
# 2. Add EntityRuler for known subscription services
# ---------------------------------------------------------

ruler = nlp.add_pipe("entity_ruler")


service_patterns = [
    {"label": "SERVICE", "pattern": "Netflix"},
    {"label": "SERVICE", "pattern": "Disney+ Hotstar"},
    {"label": "SERVICE", "pattern": "JioHotstar"},
    {"label": "SERVICE", "pattern": "Amazon Prime Video"},
    {"label": "SERVICE", "pattern": "YouTube Premium"},
    {"label": "SERVICE", "pattern": "Sony LIV"},
    {"label": "SERVICE", "pattern": "ZEE5"},
    {"label": "SERVICE", "pattern": "Spotify"},
    {"label": "SERVICE", "pattern": "Apple Music"},
    {"label": "SERVICE", "pattern": "JioSaavn"},
    {"label": "SERVICE", "pattern": "Canva Pro"},
    {"label": "SERVICE", "pattern": "Canva"},
    {"label": "SERVICE", "pattern": "Adobe Creative Cloud"},
    {"label": "SERVICE", "pattern": "Microsoft 365"},
    {"label": "SERVICE", "pattern": "Google One"},
    {"label": "SERVICE", "pattern": "Dropbox"},
    {"label": "SERVICE", "pattern": "Notion"},
    {"label": "SERVICE", "pattern": "Grammarly"},
    {"label": "SERVICE", "pattern": "ChatGPT Plus"},
    {"label": "SERVICE", "pattern": "Coursera"},
    {"label": "SERVICE", "pattern": "Udemy"},
    {"label": "SERVICE", "pattern": "Amazon Prime"},
    {"label": "SERVICE", "pattern": "LinkedIn Premium"},
]


ruler.add_patterns(service_patterns)


# ---------------------------------------------------------
# 3. Normalize service names
# ---------------------------------------------------------

def normalize_service_name(service_name: str | None) -> str | None:

    if not service_name:
        return None

    service_name = service_name.strip()

    replacements = {
        "Canva Pro": "Canva",
        "Spotify Premium": "Spotify",
    }

    for old_name, new_name in replacements.items():
        if service_name.lower() == old_name.lower():
            return new_name

    return service_name


# ---------------------------------------------------------
# 4. Detect service name
# ---------------------------------------------------------

def detect_service_name(text: str) -> str | None:

    doc = nlp(text)

    # First try EntityRuler
    for ent in doc.ents:
        if ent.label_ == "SERVICE":
            return normalize_service_name(ent.text)

    # -----------------------------------------------------
    # Fallback regex patterns for unknown services
    # -----------------------------------------------------

    fallback_patterns = [
        r"your\s+(?:new\s+)?(.+?)\s+subscription",
        r"your\s+(?:new\s+)?(.+?)\s+plan",
        r"your\s+(?:new\s+)?(.+?)\s+membership",
        r"(.+?)\s+subscription\s+will",
        r"(.+?)\s+subscription\s+renews",
        r"(.+?)\s+subscription\s+renew",
        r"welcome\s+to\s+(.+?)(?:\s+subscription)?(?:[,.]|$)",
        r"subscribing\s+to\s+(.+?)(?:[,.]|$)",
        r"your\s+(.+?)\s+account",
    ]

    for pattern in fallback_patterns:

        match = re.search(
            pattern,
            text,
            re.IGNORECASE
        )

        if match:

            service_name = match.group(1).strip()

            # Remove unwanted leading words
            service_name = re.sub(
                r"^(the|a|an|your|my|new)\s+",
                "",
                service_name,
                flags=re.IGNORECASE
            )

            # Remove unwanted trailing words
            service_name = re.sub(
                r"\s+(subscription|plan|membership)$",
                "",
                service_name,
                flags=re.IGNORECASE
            )

            service_name = service_name.strip(" .,:")

            if service_name:
                return normalize_service_name(service_name)

    return None


# ---------------------------------------------------------
# 5. Detect subscription type
# ---------------------------------------------------------

def detect_subscription_type(text: str) -> str | None:

    text_lower = text.lower()

    # Free trial
    if (
        "free trial" in text_lower
        or "trial period" in text_lower
        or re.search(r"\btrial\b", text_lower)
    ):
        return "Free Trial"

    # Paid subscription
    paid_keywords = [
        "subscription",
        "renew",
        "renewal",
        "charged",
        "membership",
        "plan",
        "billed",
        "billing",
        "payment",
    ]

    for keyword in paid_keywords:
        if keyword in text_lower:
            return "Paid"

    return None


# ---------------------------------------------------------
# 6. Detect amount and currency
# ---------------------------------------------------------

def detect_amount_and_currency(text: str):

    amount = None
    currency = None

    amount_patterns = [
        # INR
        (r"₹\s*([\d,]+(?:\.\d+)?)", "INR"),
        (r"\bRs\.?\s*([\d,]+(?:\.\d+)?)", "INR"),
        (r"\bINR\s*([\d,]+(?:\.\d+)?)", "INR"),
        (r"([\d,]+(?:\.\d+)?)\s*INR\b", "INR"),
        (r"([\d,]+(?:\.\d+)?)\s*rupees?\b", "INR"),

        # USD
        (r"\$\s*([\d,]+(?:\.\d+)?)", "USD"),
        (r"\bUSD\s*([\d,]+(?:\.\d+)?)", "USD"),
        (r"([\d,]+(?:\.\d+)?)\s*USD\b", "USD"),
        (r"([\d,]+(?:\.\d+)?)\s*dollars?\b", "USD"),

        # EUR
        (r"€\s*([\d,]+(?:\.\d+)?)", "EUR"),
        (r"\bEUR\s*([\d,]+(?:\.\d+)?)", "EUR"),
        (r"([\d,]+(?:\.\d+)?)\s*EUR\b", "EUR"),
        (r"([\d,]+(?:\.\d+)?)\s*euros?\b", "EUR"),

        # GBP
        (r"£\s*([\d,]+(?:\.\d+)?)", "GBP"),
        (r"\bGBP\s*([\d,]+(?:\.\d+)?)", "GBP"),
        (r"([\d,]+(?:\.\d+)?)\s*GBP\b", "GBP"),
        (r"([\d,]+(?:\.\d+)?)\s*pounds?\b", "GBP"),
    ]

    for pattern, detected_currency in amount_patterns:

        match = re.search(
            pattern,
            text,
            re.IGNORECASE
        )

        if match:

            try:
                amount = float(
                    match.group(1).replace(",", "")
                )
                currency = detected_currency
                return amount, currency

            except ValueError:
                pass

    return amount, currency


# ---------------------------------------------------------
# 7. Detect billing cycle
# ---------------------------------------------------------

def detect_billing_cycle(text: str) -> str | None:

    text_lower = text.lower()

    # Quarterly
    quarterly_patterns = [
        r"\bquarterly\b",
        r"\bevery\s+3\s+months?\b",
        r"\bevery\s+three\s+months?\b",
        r"\b3\s+months?\b",
    ]

    for pattern in quarterly_patterns:
        if re.search(pattern, text_lower):
            return "Quarterly"

    # Half-Yearly
    half_yearly_patterns = [
        r"\bhalf[-\s]?yearly\b",
        r"\bevery\s+6\s+months?\b",
        r"\bevery\s+six\s+months?\b",
        r"\b6\s+months?\b",
    ]

    for pattern in half_yearly_patterns:
        if re.search(pattern, text_lower):
            return "Half-Yearly"

    # Yearly
    yearly_patterns = [
        r"\byearly\b",
        r"\bannual\b",
        r"\bannually\b",
        r"\bper\s+year\b",
        r"\bevery\s+year\b",
        r"\bonce\s+a\s+year\b",
        r"\b1\s+year\b",
    ]

    for pattern in yearly_patterns:
        if re.search(pattern, text_lower):
            return "Yearly"

    # Biweekly
    biweekly_patterns = [
        r"\bbiweekly\b",
        r"\bbi[-\s]?weekly\b",
        r"\bevery\s+2\s+weeks?\b",
        r"\bevery\s+two\s+weeks?\b",
    ]

    for pattern in biweekly_patterns:
        if re.search(pattern, text_lower):
            return "Biweekly"

    # Monthly
    monthly_patterns = [
        r"\bmonthly\b",
        r"\bper\s+month\b",
        r"\bevery\s+month\b",
        r"\bonce\s+a\s+month\b",
        r"\bbilled\s+monthly\b",
        r"\b1\s+month\b",
    ]

    for pattern in monthly_patterns:
        if re.search(pattern, text_lower):
            return "Monthly"

    # Weekly
    weekly_patterns = [
        r"\bweekly\b",
        r"\bper\s+week\b",
        r"\bevery\s+week\b",
        r"\bonce\s+a\s+week\b",
        r"\bbilled\s+weekly\b",
        r"\b1\s+week\b",
    ]

    for pattern in weekly_patterns:
        if re.search(pattern, text_lower):
            return "Weekly"

    # Daily
    daily_patterns = [
        r"\bdaily\b",
        r"\bper\s+day\b",
        r"\bevery\s+day\b",
        r"\bonce\s+a\s+day\b",
        r"\bbilled\s+daily\b",
        r"\b1\s+day\b",
    ]

    for pattern in daily_patterns:
        if re.search(pattern, text_lower):
            return "Daily"

    return None


# ---------------------------------------------------------
# 8. Convert detected date into standard YYYY-MM-DD
# ---------------------------------------------------------

def convert_to_standard_date(date_text: str) -> str | None:

    date_formats = [
        "%Y-%m-%d",
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%B %d, %Y",
        "%b %d, %Y",
        "%d %B %Y",
        "%d %b %Y",
    ]

    for date_format in date_formats:

        try:
            parsed_date = datetime.strptime(
                date_text.strip(),
                date_format
            )

            return parsed_date.strftime("%Y-%m-%d")

        except ValueError:
            continue

    return None


# ---------------------------------------------------------
# 9. Detect renewal / expiry date
# ---------------------------------------------------------

def detect_renewal_date(text: str) -> str | None:

    date_patterns = [
        r"\b\d{4}-\d{2}-\d{2}\b",
        r"\b\d{2}/\d{2}/\d{4}\b",
        r"\b\d{2}-\d{2}-\d{4}\b",

        r"\b(?:January|February|March|April|May|June|July|August|September|October|November|December)"
        r"\s+\d{1,2},\s+\d{4}\b",

        r"\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"
        r"\s+\d{1,2},\s+\d{4}\b",

        r"\b\d{1,2}\s+"
        r"(?:January|February|March|April|May|June|July|August|September|October|November|December)"
        r"\s+\d{4}\b",

        r"\b\d{1,2}\s+"
        r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"
        r"\s+\d{4}\b",
    ]

    # -----------------------------------------------------
    # First search dates near renewal / expiry keywords
    # -----------------------------------------------------

    context_patterns = [
        r"(?:renewal|renews|renew|renewing|expires|expiry|expiration|ends|ending)"
        r".{0,80}?("
        r"\d{4}-\d{2}-\d{2}|"
        r"\d{2}/\d{2}/\d{4}|"
        r"\d{2}-\d{2}-\d{4}|"
        r"(?:January|February|March|April|May|June|July|August|September|October|November|December)"
        r"\s+\d{1,2},\s+\d{4}|"
        r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"
        r"\s+\d{1,2},\s+\d{4}|"
        r"\d{1,2}\s+"
        r"(?:January|February|March|April|May|June|July|August|September|October|November|December)"
        r"\s+\d{4}|"
        r"\d{1,2}\s+"
        r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"
        r"\s+\d{4}"
        r")",
    ]

    for pattern in context_patterns:

        match = re.search(
            pattern,
            text,
            re.IGNORECASE | re.DOTALL
        )

        if match:

            converted_date = convert_to_standard_date(
                match.group(1)
            )

            if converted_date:
                return converted_date

    # -----------------------------------------------------
    # Fallback: find any supported date
    # -----------------------------------------------------

    for pattern in date_patterns:

        match = re.search(
            pattern,
            text,
            re.IGNORECASE
        )

        if match:

            converted_date = convert_to_standard_date(
                match.group(0)
            )

            if converted_date:
                return converted_date

    return None


# ---------------------------------------------------------
# 10. Main parser function
# ---------------------------------------------------------

def parse_subscription_text(text: str):

    # -----------------------------------------------------
    # Validate input
    # -----------------------------------------------------

    if not text:
        return {
            "service_name": None,
            "subscription_type": None,
            "amount": None,
            "currency": None,
            "billing_cycle": None,
            "renewal_date": None,
        }

    if not isinstance(text, str):

        return {
            "service_name": None,
            "subscription_type": None,
            "amount": None,
            "currency": None,
            "billing_cycle": None,
            "renewal_date": None,
        }

    text = text.strip()

    if not text:

        return {
            "service_name": None,
            "subscription_type": None,
            "amount": None,
            "currency": None,
            "billing_cycle": None,
            "renewal_date": None,
        }

    # -----------------------------------------------------
    # Detect all available information
    # -----------------------------------------------------

    service_name = detect_service_name(text)

    subscription_type = detect_subscription_type(text)

    amount, currency = detect_amount_and_currency(text)

    billing_cycle = detect_billing_cycle(text)

    renewal_date = detect_renewal_date(text)

    # -----------------------------------------------------
    # Return partial results safely
    #
    # If some information is missing from the email,
    # the parser does NOT fail.
    #
    # Example:
    # service_name = Netflix
    # amount = None
    # renewal_date = 2026-09-20
    #
    # The available information is still returned.
    # -----------------------------------------------------

    return {
        "service_name": service_name,
        "subscription_type": subscription_type,
        "amount": amount,
        "currency": currency,
        "billing_cycle": billing_cycle,
        "renewal_date": renewal_date,
    }