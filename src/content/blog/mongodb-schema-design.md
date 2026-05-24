---
title: "MongoDB Schema Design for High-Traffic Read Operations"
date: "Mar 05, 2026"
readTime: "7 min read"
tags: ["MongoDB", "Database", "Performance"]
summary: "Learn database optimization techniques including embedding vs. referencing, compound indexes, and pre-aggregations to build ultra-fast query layers."
coverImage: "/images/mongodb_schema.png"
author: "Bhagaban Ghadai"
---

SQL developers moving to MongoDB often make the mistake of normalizing their collections—creating multiple references and relying on costly `$lookup` (join) aggregations. In MongoDB, schema design should be dictated by your application's **read patterns** rather than data relations.

## Embedding vs. Referencing

The general rule of thumb is: **embed by default** unless the sub-documents grow unboundedly or need to be queried independently. For example, in an e-commerce catalog, product reviews should be embedded directly if they are limited in number, as they are read exactly when the product detail page is viewed.

![Visualizing distributed databases](/images/mongodb_schema.png)

## The Power of Compound Indexes

For high-traffic search API routes, compound indexes are essential. When designing a compound index, follow the **Equality, Sort, Range (ESR)** rule:

1. **Equality**: Fields you match exactly (e.g., `{ status: "active" }`).
2. **Sort**: Fields you sort by (e.g., `{ createdAt: -1 }`).
3. **Range**: Fields you do a range filter on (e.g., `{ price: { $gt: 50 } }`).

```javascript
// ESR Compound Index Definition
db.products.createIndex({
  category: 1,  // Equality
  rating: -1,   // Sort
  price: 1      // Range
});
```

## Results

By implementing ESR compound indexes and pre-calculating average ratings on document save (using pre-aggregation), we reduced our catalog load times from 850ms to 42ms under a load of 10,000 concurrent virtual users!
