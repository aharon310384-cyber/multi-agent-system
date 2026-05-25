function recencyDecay(ts) {
  if (!ts) return 0.5;
  const ageH = (Date.now() - new Date(ts).getTime()) / 36e5;
  if (!Number.isFinite(ageH) || ageH < 0) return 0.5;
  return Math.exp(-ageH / 48);
}

function rank(items, { weights = { authority: 0.35, cluster: 0.25, recency: 0.25, alreadyHas: -0.5 } } = {}) {
  return items
    .map((it) => {
      const authority = it.authority || 0.5;
      const cluster = Math.min(1, (it.cluster_size || 1) / 5);
      const recency = recencyDecay(it.ts);
      const alreadyHas = it._already_in_stack ? 1 : 0;
      const score =
        weights.authority * authority +
        weights.cluster * cluster +
        weights.recency * recency +
        weights.alreadyHas * alreadyHas;
      return { ...it, score: Number(score.toFixed(4)) };
    })
    .sort((a, b) => b.score - a.score);
}

module.exports = { rank, recencyDecay };
