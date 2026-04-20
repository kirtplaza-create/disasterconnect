import { parseAIJSON } from '../src/services/aiService.js';

const testCases = [
  {
    name: "Perfect JSON",
    raw: '{"food": 100, "water": 200}',
    expect: { food: 100, water: 200 }
  },
  {
    name: "Markdown & Text",
    raw: 'Here is your analysis:\n```json\n{"food": 100, "water": 200}\n```\nHope this helps!',
    expect: { food: 100, water: 200 }
  },
  {
    name: "Missing Commas (Inline)",
    raw: '{"food": 100 "water": 200}',
    expect: { food: 100, water: 200 }
  },
  {
    name: "Missing Commas (No Space - Numbers)",
    raw: '{"food":100"water":200}',
    expect: { food: 100, water: 200 }
  },
  {
    name: "Missing Commas (No Space - Strings)",
    raw: '{"a":"v1""b":"v2"}',
    expect: { a: "v1", b: "v2" }
  },
  {
    name: "Missing Commas (Objects in Array)",
    raw: '[{"x":1}{"y":2}]',
    expect: [{ x: 1 }, { y: 2 }]
  },
  {
    name: "Unquoted Keys with Spaces",
    raw: '{food packs: 100, water liters: 200}',
    expect: { "food packs": 100, "water liters": 200 }
  },
  {
    name: "Literal Newlines in Strings",
    raw: '{"desc": "Line 1\nLine 2"}',
    expect: { "desc": "Line 1\nLine 2" }
  },
  {
    name: "Newline Comma Collision",
    raw: '{"a":1\n"b":2}',
    expect: { a: 1, b: 2 }
  },
  {
    name: "Negative Numbers & Boundary",
    raw: '{"val":-100"next":200}',
    expect: { val: -100, next: 200 }
  },
  {
    name: "Unit Leakage",
    raw: '{"qty": 100 units, "price": 50 dollars}',
    expect: { qty: 100, price: 50 }
  },
  {
    name: "Compact Object Boundary",
    raw: '[{"a":1}{"b":2}]',
    expect: [{ a: 1 }, { b: 2 }]
  },
  {
    name: "Parenthetical Noise",
    raw: '{"qty": 100 (approx), "next": 200}',
    expect: { qty: 100, next: 200 }
  },
  {
    name: "Unquoted Tail Noise",
    raw: '{"a": 100 some text "b": 200}',
    expect: { a: 100, b: 200 }
  },
  {
    name: "Internal Quotes",
    raw: '{"strategy": "3 days, considering evacuees" hydration needs", "next": "ok"}',
    expect: { strategy: "3 days, considering evacuees' hydration needs", next: "ok" }
  },
  {
    name: "Multi-pass Missing Commas",
    raw: '{"a":1"b":2"c":3}',
    expect: { a: 1, b: 2, c: 3 }
  },
  {
    name: "Smart Quotes",
    raw: '{"a“: ”value”, ‘b’: ‘val’}',
    expect: { a: "value", b: "val" }
  },
  {
    name: "Newline Noise",
    raw: '{"qty": 100 units\n}',
    expect: { qty: 100 }
  },
  {
    name: "Unquoted Array Elements",
    raw: '{"items": [food, water], "qty": 10}',
    expect: { items: ["food", "water"], qty: 10 }
  },
  {
    name: "Hidden Garbage",
    raw: '{"qty": 100\u00A0units\uFEFF}',
    expect: { qty: 100 }
  },
  {
    name: "Truncated Response",
    raw: '{"food": 100, "water": 200, "reason": "We need more',
    expect: { food: 100, water: 200, reason: "We need more" }
  },
  {
    name: "Unquoted Keys",
    raw: '{food: 100, water: 200}',
    expect: { food: 100, water: 200 }
  },
  {
    name: "Single Quotes",
    raw: "{'food': 100, 'water': 200}",
    expect: { food: 100, water: 200 }
  },
  {
    name: "Floating Punctuation Quotes",
    raw: `{"v": "result of 645, ", then multiplied by 3."}`,
    expect: { v: "result of 645, ', then multiplied by 3." }
  },
  {
    name: "Internal Punctuation Quotes",
    raw: '{"note": "Impact on populations,"including the elderly","children", and others."}',
    expect: { note: "Impact on populations,'including the elderly','children', and others." }
  },
  {
    name: "Mismatched List Quotes",
    raw: '{"reasoning": "presence of elderly, \'children\',"evacuees\', and injured individuals"}',
    expect: { reasoning: "presence of elderly, 'children','evacuees', and injured individuals" }
  },
  {
    name: "Ratio & Pseudo-Key",
    raw: `{"v": "using the "1:1" ratio and logic":1."}`,
    expect: { v: "using the '1:1' ratio and logic':1." }
  },
  {
    name: "Priority Items Mismatched Quotes with Spaces",
    raw: '{"priorityItems": ["food packs\', "water liters\', "medical kits"]}',
    expect: { priorityItems: ["food packs", "water liters", "medical kits"] }
  },
  {
    name: "Pseudo-Key Collision",
    raw: '{"reasoning": This is a : test with a colon, "other": 1}',
    expect: { reasoning: "This is a : test with a colon", other: 1 }
  },
  { 
    name: "Greedy Boundary (HEX SNIPER FIX)", 
    raw: '{"reasoning": "The disaster affects people, \'including 61 families\", requires a comprehensive response.", "other": 1}',
    expect: { reasoning: "The disaster affects people, 'including 61 families', requires a comprehensive response.", other: 1 }
  },
  {
    name: "Truncation Bug (Phase 21 Fix)",
    raw: '{"reasoning": "Total population of 215 people, \"including 61 families\", requires a response.", "other": 1}',
    expect: { reasoning: "Total population of 215 people, 'including 61 families', requires a response.", other: 1 }
  }
];

console.log("🚀 Starting AI Parser Stress Test...\n");

testCases.forEach(tc => {
  try {
    const result = parseAIJSON(tc.raw);
    console.log(`✅ ${tc.name}: PASSED`);
    // console.log("Result:", JSON.stringify(result));
  } catch (e) {
    console.log(`❌ ${tc.name}: FAILED - ${e.message}`);
    // console.log("Raw:", tc.raw);
  }
});
