import express from "express";
import chalk from "chalk";
import Property, { IPropertyDoc } from "../../schemas/property.schema";
import * as _ from "lodash";
import { QuerySelector } from "mongodb";
import { promisify } from "util";

const searchRouter = express.Router();

class NumberRangeFilter {
  constructor(
    public readonly minimum?: number,
    public readonly maximum?: number
  ) {}

  static parse({ minimum, maximum }: RawNumberRangeFilter) {
    return _.isUndefined(minimum) && _.isUndefined(maximum)
      ? undefined
      : new NumberRangeFilter(
          ifDef(minimum, parseInt),
          ifDef(maximum, parseInt)
        );
  }

  toMongoFilters(): QuerySelector<number> {
    const filters: QuerySelector<number> = {};

    if (!_.isUndefined(this.minimum)) {
      filters.$gte = this.minimum;
    }

    if (!_.isUndefined(this.maximum)) {
      filters.$lte = this.maximum;
    }

    return filters;
  }
}

interface RawNumberRangeFilter {
  minimum?: string;
  maximum?: string;
}

interface RawPropertiesSearchFilters {
  price?: RawNumberRangeFilter;
  rooms?: string;
  maxDistanceFromCampus?: string;
  leaseDuration?: string;
}

const ifDef = <T>(val: T | undefined, transform: (val: T) => any): any => {
  return _.isUndefined(val)
    ? undefined
    : _.isUndefined(transform)
    ? val
    : transform(val);
};

interface PropertiesSearchFilters {
  price?: NumberRangeFilter;
  rooms?: number;
  maxDistanceFromCampus?: number;
  leaseDuration?: string;
}

class PropertiesSearchFiltersObject implements PropertiesSearchFilters {
  private constructor(
    public readonly price?: NumberRangeFilter,
    public readonly rooms?: number,
    public readonly maxDistanceFromCampus?: number,
    public readonly leaseDuration?: string
  ) {}

  static parse({
    price,
    rooms,
    maxDistanceFromCampus,
    leaseDuration,
  }: RawPropertiesSearchFilters) {
    return new PropertiesSearchFiltersObject(
      ifDef(price, NumberRangeFilter.parse),
      ifDef(rooms, parseInt),
      ifDef(maxDistanceFromCampus, parseInt),
      leaseDuration
    );
  }

  toMongoFilters() {
    const filters: {
      price?: QuerySelector<number>;
      rooms?: number;
      maxDistanceFromCampus?: number;
      lease_duration?: QuerySelector<string>;
    } = {};

    if (!_.isUndefined(this.price)) {
      filters.price = this.price.toMongoFilters();
    }

    if (!_.isUndefined(this.rooms)) {
      filters.rooms = this.rooms;
    }

    // if (!_.isUndefined(this.maxDistanceFromCampus)) {
    //   filters.maxDistanceFromCampus = this.maxDistanceFromCampus;
    // }

    if (!_.isUndefined(this.leaseDuration)) {
      filters.lease_duration = { $eq: this.leaseDuration };
    }

    return filters;
  }
}

searchRouter.get("/properties", async (req, res) => {
  let offset: number;
  let limit: number;
  let filters: PropertiesSearchFiltersObject;

  try {
    offset = ifDef(req.query.offset as string, parseInt) ?? 0;
    limit = ifDef(req.query.limit as string, parseInt) ?? 10;

    filters = PropertiesSearchFiltersObject.parse(
      req.query.filters as qs.ParsedQs
    );
  } catch (err) {
    console.log(chalk.bgRed(`❌ Bad properties search query.`));
    res.status(400).json({
      success: false,
      error: `Bad query`,
    });
    return;
  }

  console.log(chalk.bgBlue(`👉 GET /api/search/properties`));
  console.log(chalk.blue(`\toffset: ${offset}`));
  console.log(chalk.blue(`\tlimit: ${limit}`));

  // TODO get search properties from body
  // (min/max price, available rooms, max distance from campus, lease period)
  console.log(filters.toMongoFilters());
  try {
    const properties_docs = await Property.find(filters.toMongoFilters())
      .sort({ _id: "asc" })
      .skip(offset)
      .limit(limit)
      .exec();

    const doc_count = await Property.find(filters.toMongoFilters())
      .countDocuments()
      .exec();

    console.log(
      chalk.bgGreen(
        `✔ Successfully found ${
          properties_docs ? properties_docs.length : 0
        } property documents!`
      )
    );
    res.json({
      success: true,
      count: doc_count,
      properties: properties_docs
        ? properties_docs.map((prop_) => prop_.toObject())
        : [],
    });
  } catch (err) {
    console.log(chalk.bgRed(`❌ Error in search.`));
    console.log(err);
    res.status(500).json({
      success: false,
      error: `Internal server error`,
    });
  }
});

export default searchRouter;
