class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObject = { ...this.queryString };
    const excludedFields = ["select", "sort", "limit", "page"];
    excludedFields.forEach((field) => delete queryObject[field]);

    let queryStr = JSON.stringify(queryObject);

    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  select() {
    if (this.queryString.select) {
      const selectBy = this.queryString.select.split(",").join(" ");
      this.query = this.query.select(selectBy);
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page * 1);
    const limit = parseInt(this.queryString.limit * 1);

    const startIndex = (page - 1) * limit;

    this.query = this.query.skip(startIndex).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
