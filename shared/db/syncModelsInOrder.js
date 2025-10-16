/**
 * Automatically sync Sequelize models in dependency order
 * by analyzing foreign key references between them.
 */
async function syncModelsInOrder(models, logger, options = { alter: true }) {
  const dependencyGraph = new Map();

  // Build dependency graph
  for (const [modelName, model] of Object.entries(models)) {
    const deps = new Set();

    // Look for foreign key references in model's attributes
    for (const attr of Object.values(model.rawAttributes)) {
      if (attr.references && attr.references.model) {
        const refModel =
          typeof attr.references.model === 'string'
            ? attr.references.model
            : attr.references.model.name;
        deps.add(refModel);
      }
    }

    dependencyGraph.set(modelName, deps);
  }

  // Topological sort (detect proper order)
  const visited = new Set();
  const ordered = [];

  function visit(modelName) {
    if (visited.has(modelName)) return;
    visited.add(modelName);
    const deps = dependencyGraph.get(modelName);
    if (deps) {
      for (const dep of deps) {
        if (dependencyGraph.has(dep)) visit(dep);
      }
    }
    ordered.push(modelName);
  }

  for (const modelName of dependencyGraph.keys()) visit(modelName);

  // Remove duplicates while preserving order
  const uniqueOrder = [...new Set(ordered)];

  logger?.info(`🔄 Syncing models in dependency order: ${uniqueOrder.join(' → ')}`);

  // Perform sync sequentially
  for (const modelName of uniqueOrder) {
    const model = models[modelName];
    if (!model) continue;
    await model.sync(options);
    logger?.info(`✅ Synced: ${modelName}`);
  }
}

module.exports = syncModelsInOrder;
