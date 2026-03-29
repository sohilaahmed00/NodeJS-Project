export class APIFeatures {
  constructor(query, reqQuery) {
    this.query = query;
    this.reqQuery = reqQuery;
  }

  filter() {
    let filterObj = { ...this.reqQuery };
    const excludedFields = ['sort', 'page', 'limit', 'fields'];
    excludedFields.forEach((el) => delete filterObj[el]);

    filterObj = JSON.parse(
      JSON.stringify(filterObj).replace(
        /\b(lt|lte|gt|gte)\b/g,
        (match) => `$${match}`,
      ),
    );

    this.query = this.query.find(filterObj);
    // this.query = this.query.where(filterObj);

    return this;
  }

  sort() {
    if (this.reqQuery.sort) {
      const sortBy = this.reqQuery.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.reqQuery.fields) {
      const fields = this.reqQuery.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.reqQuery.page || 1;
    const limit = this.reqQuery.limit || 10;
    const skip = (page - 1) * limit;

    // console.log(limit);

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
