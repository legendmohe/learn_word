import json
from pathlib import Path
from datetime import datetime
from collections import Counter, defaultdict

INPUT_FILE = Path(r"c:\Users\legendmohe\Desktop\english_words_3_up_full.json")
OUTPUT_PROCESSED = Path(r"c:\Users\legendmohe\Desktop\english_words_3_up_full_processed.json")
OUTPUT_STATS = Path(r"c:\Users\legendmohe\Desktop\english_words_3_up_full_stats.json")
LOG_FILE = Path(r"c:\Users\legendmohe\Desktop\english_words_3_up_full_process.log")

EMOJI = "🔤"
DESC_PREFIX = "三年级上册"

def unit_key_to_id(unit_name: str) -> str:
    return unit_name.lower().replace(" ", "_")

def normalize_entry(entry: dict, unit: str, idx: int, logs: list) -> dict:
    word = entry.get("word")
    meaning = entry.get("meaning")
    phonetic = entry.get("phonetic")
    phonemes = entry.get("phonemes")
    phonemes_a = entry.get("phonemes_a")

    if not isinstance(phonemes, list):
        phonemes = [] if phonemes is None else [phonemes]
    if not isinstance(phonemes_a, list):
        phonemes_a = [] if phonemes_a is None else [phonemes_a]

    if meaning is None:
        meaning = ""
        logs.append(f"[MISSING_MEANING] unit={unit} index={idx} word={word!r}")

    if not word:
        placeholder = f"_missing_word_{unit}_{idx}"
        logs.append(f"[MISSING_WORD] unit={unit} index={idx} replaced_with={placeholder}")
        word = placeholder

    if phonetic is None:
        phonetic = ""
        logs.append(f"[MISSING_PHONETIC] unit={unit} index={idx} word={word!r}")

    if len(phonemes) == 0:
        logs.append(f"[EMPTY_PHONEMES] unit={unit} index={idx} word={word!r}")

    if len(phonemes_a) == 0:
        logs.append(f"[EMPTY_PHONEMES_A] unit={unit} index={idx} word={word!r}")

    return {
        "word": word,
        "meaning": meaning,
        "phonetic": phonetic,
        "phonemes": phonemes,
        "phonemes_a": phonemes_a
    }

def transform(data: dict):
    courses = []
    logs = []
    for unit_name, entries in data.items():
        if not isinstance(entries, list):
            logs.append(f"[INVALID_ENTRIES] unit={unit_name} type={type(entries).__name__}")
            continue
        processed_words = [
            normalize_entry(e if isinstance(e, dict) else {}, unit_name, i, logs)
            for i, e in enumerate(entries)
        ]
        courses.append({
            "id": unit_key_to_id(unit_name),
            "name": unit_name,
            "emoji": EMOJI,
            "description": f"{DESC_PREFIX}{unit_name}",
            "words": processed_words
        })
    return {"courses": courses}, logs

def build_stats(processed: dict):
    courses = processed["courses"]
    total_word_count = 0
    unit_stats = []
    missing_meaning = 0
    missing_phonetic = 0
    empty_phonemes = 0
    empty_phonemes_a = 0
    generated_placeholders = 0

    global_word_list = []
    word_to_units = defaultdict(set)

    phoneme_counter = Counter()
    word_length_counter = Counter()
    phoneme_len_counter = Counter()
    completeness_score_counter = Counter()

    unit_quality = []

    detail_issues = []

    for course in courses:
        unit_name = course["name"]
        words = course["words"]
        unit_word_count = len(words)
        total_word_count += unit_word_count

        unit_missing_phonetic = 0
        unit_missing_meaning = 0
        unit_empty_phonemes = 0
        unit_empty_phonemes_a = 0
        unit_completeness_scores = []

        for idx, w in enumerate(words):
            word = w.get("word", "")
            meaning = w.get("meaning", "")
            phonetic = w.get("phonetic", "")
            phonemes = w.get("phonemes", [])
            phonemes_a = w.get("phonemes_a", [])

            # global lists
            global_word_list.append(word)
            word_to_units[word].add(unit_name)

            # stats
            if meaning == "":
                missing_meaning += 1
                unit_missing_meaning += 1
                detail_issues.append({"unit": unit_name, "index": idx, "issue": "missingMeaning", "word": word})
            if phonetic == "":
                missing_phonetic += 1
                unit_missing_phonetic += 1
                detail_issues.append({"unit": unit_name, "index": idx, "issue": "missingPhonetic", "word": word})
            if len(phonemes) == 0:
                empty_phonemes += 1
                unit_empty_phonemes += 1
                detail_issues.append({"unit": unit_name, "index": idx, "issue": "emptyPhonemes", "word": word})
            if len(phonemes_a) == 0:
                empty_phonemes_a += 1
                unit_empty_phonemes_a += 1
                detail_issues.append({"unit": unit_name, "index": idx, "issue": "emptyPhonemesA", "word": word})
            if word.startswith("_missing_word_"):
                generated_placeholders += 1
                detail_issues.append({"unit": unit_name, "index": idx, "issue": "generatedWordPlaceholder", "word": word})

            # counts for distributions
            word_length_counter[len(word)] += 1
            phoneme_len_counter[len(phonemes)] += 1
            phoneme_counter.update(phonemes)

            # completeness score
            completeness = 0
            if meaning != "": completeness += 1
            if phonetic != "": completeness += 1
            if len(phonemes) > 0: completeness += 1
            if len(phonemes_a) > 0: completeness += 1
            completeness_score_counter[completeness] += 1
            unit_completeness_scores.append(completeness)

        avg_unit_completeness = (
            sum(unit_completeness_scores) / len(unit_completeness_scores)
            if unit_completeness_scores else 0
        )
        unit_quality.append({
            "unit": unit_name,
            "wordCount": unit_word_count,
            "missingMeaning": unit_missing_meaning,
            "missingPhonetic": unit_missing_phonetic,
            "emptyPhonemes": unit_empty_phonemes,
            "emptyPhonemesA": unit_empty_phonemes_a,
            "avgCompleteness": round(avg_unit_completeness, 3)
        })

        unit_stats.append({
            "id": course["id"],
            "name": unit_name,
            "wordCount": unit_word_count
        })

    # duplicates
    duplicates_global = [
        {"word": w, "count": len(units), "units": sorted(units)}
        for w, units in word_to_units.items() if len(units) > 1
    ]

    per_unit_duplicates = {}
    for course in courses:
        counts = Counter([w["word"] for w in course["words"]])
        dupe_list = [{"word": w, "count": c} for w, c in counts.items() if c > 1]
        if dupe_list:
            per_unit_duplicates[course["name"]] = dupe_list

    # buckets
    def build_bucket(counter: Counter, ranges):
        # ranges: list of (label, min, max) where max can be None for open-ended
        bucket_result = []
        for label, mn, mx in ranges:
            total = 0
            for length, cnt in counter.items():
                if length >= mn and (mx is None or length <= mx):
                    total += cnt
            bucket_result.append({"range": label, "count": total})
        return bucket_result

    word_length_ranges = [
        ("1-3", 1, 3),
        ("4-6", 4, 6),
        ("7-9", 7, 9),
        ("10+", 10, None),
    ]
    phoneme_length_ranges = [
        ("1-2", 1, 2),
        ("3-4", 3, 4),
        ("5-6", 5, 6),
        ("7+", 7, None),
    ]

    difficulty_buckets = {
        "byLetters": build_bucket(word_length_counter, word_length_ranges),
        "byPhonemes": build_bucket(phoneme_len_counter, phoneme_length_ranges)
    }

    # completeness distribution
    score_distribution = [
        {"score": score, "count": count}
        for score, count in sorted(completeness_score_counter.items())
    ]
    average_completeness = (
        sum(score * count for score, count in completeness_score_counter.items()) /
        sum(completeness_score_counter.values())
        if completeness_score_counter else 0
    )

    stats = {
        "summary": {
            "courseCount": len(courses),
            "totalWordCount": total_word_count,
            "units": unit_stats
        },
        "dataQuality": {
            "missingMeaning": missing_meaning,
            "missingPhonetic": missing_phonetic,
            "emptyPhonemes": empty_phonemes,
            "emptyPhonemesA": empty_phonemes_a,
            "generatedWordPlaceholders": generated_placeholders,
            "detailsSample": detail_issues[:50],  # 防止文件过大，只放前 50 条
            "detailsTotal": len(detail_issues)
        },
        "duplicates": {
            "global": duplicates_global,
            "perUnit": per_unit_duplicates
        },
        "phonemeStats": {
            "uniquePhonemes": len(phoneme_counter),
            "topPhonemes": [
                {"symbol": p, "count": c}
                for p, c in phoneme_counter.most_common(50)
            ]
        },
        "difficultyBuckets": difficulty_buckets,
        "completeness": {
            "averageScore": round(average_completeness, 3),
            "scoreDistribution": score_distribution
        },
        "unitQuality": unit_quality
    }

    return stats

def main():
    with INPUT_FILE.open(encoding="utf-8") as f:
        data = json.load(f)

    processed, logs = transform(data)
    stats = build_stats(processed)

    with OUTPUT_PROCESSED.open("w", encoding="utf-8") as f:
        json.dump(processed, f, ensure_ascii=False, indent=2)

    with OUTPUT_STATS.open("w", encoding="utf-8") as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)

    timestamp = datetime.now().isoformat(timespec="seconds")
    with LOG_FILE.open("w", encoding="utf-8") as lf:
        lf.write(f"Process Time: {timestamp}\n")
        lf.write(f"Input File: {INPUT_FILE}\nProcessed File: {OUTPUT_PROCESSED}\nStats File: {OUTPUT_STATS}\n\n")
        lf.write("Logs:\n")
        if logs:
            for line in logs:
                lf.write(line + "\n")
        else:
            lf.write("[NO_ISSUES]\n")

    print(f"Processed written: {OUTPUT_PROCESSED}")
    print(f"Stats written: {OUTPUT_STATS}")
    print(f"Log entries: {len(logs)} (see {LOG_FILE})")

if __name__ == "__main__":
    main()