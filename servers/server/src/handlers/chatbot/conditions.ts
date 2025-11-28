import type { ConditionRule } from "./types";

export function evalRow(rule: ConditionRule, vars: Record<string, any>) {
  let key = rule.var.trim();
  let left = vars[key];

  if (left === undefined) {
    const alt = key.startsWith("@") ? key.slice(1) : `@${key}`;
    left = vars[alt];
  }

  const right = rule.value;

  switch (rule.op) {
    case "exists":
      return !!(left && String(left).trim() !== "");
    case "eq":
      return String(left ?? "") === String(right ?? "");
    case "ne":
      return String(left ?? "") !== String(right ?? "");
    case "gt":
      return Number(left) > Number(right);
    case "lt":
      return Number(left) < Number(right);
    case "contains":
      return String(left ?? "").includes(String(right ?? ""));
    default:
      return false;
  }
}

export function evalCondition(
  node: { logic: ConditionRule[] },
  vars: Record<string, any>,
) {
  const rules = node?.logic || [];
  if (!rules.length) return false;

  let result = evalRow(rules[0], vars);

  for (let i = 1; i < rules.length; i++) {
    const rule = rules[i];
    const res = evalRow(rule, vars);

    if (rule.join === "and") result = result && res;
    else if (rule.join === "or") result = result || res;
  }

  return result;
}
