import express from "express";
import chalk from "chalk";
import Property, { IPropertyDoc } from "../../schemas/property.schema";
import * as _ from "lodash";
import { QuerySelector } from "mongodb";

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

    // if (!_.isUndefined(this.rooms)) {
    //   filters.rooms = this.rooms;
    // }

    // if (!_.isUndefined(this.maxDistanceFromCampus)) {
    //   filters.maxDistanceFromCampus = this.maxDistanceFromCampus;
    // }

    if (!_.isUndefined(this.leaseDuration)) {
      filters.lease_duration = { $eq: this.leaseDuration };
    }

    return filters;
  }
}

searchRouter.get("/properties", (req, res) => {
  const offset = ifDef(req.query.offset as string, parseInt) ?? 0;
  const limit = ifDef(req.query.limit as string, parseInt) ?? 10;

  const filters = PropertiesSearchFiltersObject.parse(
    req.query.filters as qs.ParsedQs
  );

  console.log(chalk.bgBlue(`👉 GET /api/search/properties`));
  console.log(chalk.blue(`\toffset: ${offset}`));
  console.log(chalk.blue(`\tlimit: ${limit}`));

  // TODO get search properties from body
  // (min/max price, available rooms, max distance from campus, lease period)
  console.log(filters.toMongoFilters());
  Property.find(filters.toMongoFilters())
    .sort({ _id: "asc" })
    .skip(offset)
    .limit(limit)
    .exec((err, properties_docs) => {
      if (err) {
        console.log(chalk.bgRed(`❌ Error searching for properties.`));
        console.log(err);

        res.json({
          success: false,
          error: `Query error`,
        });
      } else {
        // Must run second query to find the count of possible results
        Property.find(filters.toMongoFilters())
          .count()
          .exec((err, doc_count) => {
            if (err) {
              console.log(
                chalk.bgRed(`❌ Error trying to get count of search results.`)
              );
              res.json({
                success: false,
                error: `Internal server error`,
              });
            } else {
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
            }
          });
      }
    });
});

export default searchRouter;
