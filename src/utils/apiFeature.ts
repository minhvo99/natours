import { Request } from 'express';

export default class APIFeature {
   query: any;
   queryString: any | Request;

   constructor(query: any, queryString: any | Request) {
      this.query = query;
      this.queryString = queryString;
   }

   filter() {
      const queryObj = { ...this.queryString };
      const excludedFields = ['page', 'sort', 'limit', 'fields'];
      excludedFields.forEach((el) => delete queryObj[el]);

      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

      this.query.find(JSON.parse(queryStr));
      return this;
   }
   sort() {
      if (typeof this.queryString?.sort === 'string' && this.queryString.sort) {
         const sortBy = this.queryString.sort.split(',').join(' ');
         this.query = this.query.sort(sortBy);
      } else {
         this.query = this.query.sort('-createdAt');
      }
      return this;
   }

   limit() {
      if (typeof this.queryString?.fields === 'string' && this.queryString.fields) {
         const fields = this.queryString.fields.split(',').join(' ');
         this.query = this.query.select(fields);
      } else {
         this.query = this.query.select('-__v');
      }
      return this;
   }

   limitFields() {
      if (typeof this.queryString?.fields === 'string' && this.queryString.fields) {
         const fields = this.queryString.fields.split(',').join(' ');
         this.query = this.query.select(fields);
      } else {
         this.query = this.query.select('-__v');
      }
      return this;
   }

   paginate() {
      const page = (this.queryString.page as any) * 1 || 1;
      const limit = (this.queryString.limit as any) * 1 || 100;
      const skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit);

      return this;
   }
}
