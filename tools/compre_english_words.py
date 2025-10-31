import json
from pathlib import Path
from collections import OrderedDict

base_path = Path(r"c:\Users\legendmohe\Desktop\english_words_3_up.json")
full_path = Path(r"c:\Users\legendmohe\Desktop\english_words_3_up_full.json")

with base_path.open(encoding="utf-8") as f:
    base = json.load(f, object_pairs_hook=OrderedDict)
with full_path.open(encoding="utf-8") as f:
    full = json.load(f, object_pairs_hook=OrderedDict)

def words_list(d):
    return {unit: [entry.get("word") for entry in entries] for unit, entries in d.items()}

base_words = words_list(base)
full_words = words_list(full)

diffs = []

# 单元差异（缺失或新增）
base_units = set(base_words)
full_units = set(full_words)
if base_units != full_units:
    diffs.append({
        "unit_set_difference": {
            "in_base_not_full": sorted(base_units - full_units),
            "in_full_not_base": sorted(full_units - base_units)
        }
    })

# 逐单元数量与顺序核对
unit_summaries = []
for unit in base_words:
    bw = base_words[unit]
    fw = full_words.get(unit, [])
    unit_info = {
        "unit": unit,
        "base_count": len(bw),
        "full_count": len(fw),
        "count_equal": len(bw) == len(fw)
    }
    # 顺序与内容核对
    if len(bw) == len(fw):
        mismatches = [
            {"index": i, "base": b, "full": f}
            for i, (b, f) in enumerate(zip(bw, fw)) if b != f
        ]
        if mismatches:
            unit_info["order_mismatches"] = mismatches
            diffs.append({"unit": unit, "order_mismatches": mismatches})
    else:
        diffs.append({"unit": unit, "count_diff": (len(bw), len(fw))})
    unit_summaries.append(unit_info)

total_base = sum(len(v) for v in base_words.values())
total_full = sum(len(v) for v in full_words.values())

print("Unit summaries:")
for u in unit_summaries:
    print(u)

print("\nTotal (base, full):", (total_base, total_full))
print("Totals equal:", total_base == total_full)

print("\nDiff details (empty 表示无差异):")
print(json.dumps(diffs, ensure_ascii=False, indent=2))

# 可选：检查扩展字段完整性
missing_phonetic = []
for unit, entries in full.items():
    for i, e in enumerate(entries):
        if "phonetic" not in e or "phonemes" not in e or "phonemes_a" not in e:
            missing_phonetic.append({"unit": unit, "index": i, "word": e.get("word")})

print("\nMissing extended fields count:", len(missing_phonetic))
if missing_phonetic:
    print(json.dumps(missing_phonetic[:10], ensure_ascii=False, indent=2), "...")
