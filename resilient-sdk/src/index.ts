/**
 * ResilientDB SDK - Get Transactions Only
 */

import { Configuration } from '../sdk/src/runtime';
import { DefaultApi } from '../sdk/src/apis/DefaultApi';
import { GetTransactionRequest, CreateCollectionRequest, CreateCollectionRequestOptions, CreateCollectionRequestSchema } from '../sdk/src';

export interface ResilientDBConfig {
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface CollectionOptions {
  primary_key: string;
  secondary_key?: string;
  filter_policy?: string;
  filter_policy_bits_per_key?: number;
}

export interface CollectionSchema {
  fields: Record<string, string>[];
  required: string[];
}

// Type mapping for TypeScript types to database types
type TypeMapping = {
  string: 'string';
  number: 'integer';
  boolean: 'boolean';
  Date: 'datetime';
  'string | null': 'string';
  'number | null': 'integer';
  'boolean | null': 'boolean';
  'Date | null': 'datetime';
};

// Helper type to extract field types from a TypeScript interface
type ExtractFieldTypes<T> = {
  [K in keyof T]: T[K] extends keyof TypeMapping 
    ? TypeMapping[T[K]] 
    : T[K] extends string | number | boolean | Date 
      ? 'string' | 'integer' | 'boolean' | 'datetime'
      : 'string';
};

// Helper to convert TypeScript interface to schema fields
// Type-safe field schema builder
type FieldType = 'string' | 'integer' | 'boolean';

type SchemaBuilder<T> = {
  [K in keyof T]: FieldType;
};

function createSchemaFromFields<T extends Record<string, any>>(
  fields: SchemaBuilder<T>,
  requiredFields: (keyof T)[] = []
): CollectionSchema {
  const schemaFields: Record<string, string>[] = [];
  const required: string[] = requiredFields.map(field => String(field));

  // Convert the fields object to the API format
  Object.entries(fields).forEach(([key, type]) => {
    schemaFields.push({ [key]: type });
  });

  return {
    fields: schemaFields,
    required
  };
}

const DEFAULT_COLLECTION_FILTER_OPTIONS = {
  filter_policy: 'leveldb.BuiltinBloomFilter',
  filter_policy_bits_per_key: 20
} as const;

export class ResilientDB {
  private api: DefaultApi;

  constructor(config: ResilientDBConfig = {}) {
    const configuration = new Configuration({
      basePath: config.baseUrl || 'http://54.204.140.141:18000',
      headers: config.headers || {},
    });

    this.api = new DefaultApi(configuration);
  }

  /**
   * Get transactions by filter with type inference
   */
  async find<T = any>(
    collectionName: string,
    filter: Partial<T>
  ): Promise<T[]> {
    try {
      // Get the first filter key-value pair
      const entries = Object.entries(filter);
      if (entries.length === 0) {
        throw new Error('Filter object cannot be empty');
      }
      
      const [filterKey, filterValue] = entries[0];
      
      const request: GetTransactionRequest = {
        collectionName: collectionName,
        filterKey: filterKey,
        filterValue: String(filterValue),
      };

      const response = await this.api.find({
        getTransactionRequest: request,
      });
      
      if (response.status === "success" && response.data) {
        return JSON.parse(response.data);
      } else {
        throw new Error('Failed to get transactions');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Get transactions failed: ${errorMessage}`);
    }
  }

  /**
   * Get transactions by filter (raw version)
   * Equivalent to your curl example:
   * curl --location 'http://54.204.140.141:18000/v2/transactions/get' \
   * --header 'Content-Type: application/json' \
   * --data '{
   *     "collection_name": "users",
   *     "filter_key": "age",
   *     "filter_value": "30"
   * }'
   */
  async findRaw(
    collectionName: string,
    filterKey: string,
    filterValue: string
  ): Promise<any[]> {
    return this.find(collectionName, { [filterKey]: filterValue } as any);
  }

  /**
   * Find a record by ID with type inference
   */
  async findById<T = any>(
    collectionName: string,
    id: T extends { id: infer ID } ? ID : string
  ): Promise<T | null> {
    try {
      //TODO: fetch primary key from collection schema
      const request: GetTransactionRequest = {
        collectionName: collectionName,
        filterKey: "id",
        filterValue: String(id),
      };

      const response = await this.api.find({
        getTransactionRequest: request,
      });
      
      if (response.status === "success" && response.data) {
        const data = JSON.parse(response.data);
        const result = Array.isArray(data) ? data[0] : data;
        return result as T | null;
      } else {
        throw new Error('Failed to find record by ID');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Find by ID failed: ${errorMessage}`);
    }
  }

  /**
   * Find a record by ID (raw version)
   * Equivalent to your curl example:
   * curl --location 'http://54.204.140.141:18000/v2/transactions/get' \
   * --header 'Content-Type: application/json' \
   * --data '{
   *     "collection_name": "users",
   *     "filter_key": "id",
   *     "filter_value": "11"
   * }'
   */
  async findByIdRaw(
    collectionName: string,
    id: string
  ): Promise<any> {
    return this.findById(collectionName, id);
  }

  /**
   * Commit a transaction (INSERT, CREATE_COLLECTION, etc.)
   */
  async commitTransaction(
    transactionId: string,
    collectionName: string,
    value: any
  ): Promise<void> {
    try {
      const request = {
        id: transactionId,
        value: {
          collectionName,
          ...value
        }
      };
      const response = await this.api.commitTransaction({
        commitTransactionRequest: request,
      });
      console.log("Response:", JSON.stringify(response, null, 2));
      if (response.status !== 'success') {
        throw new Error(`Failed to commit transaction: ${transactionId}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Commit transaction failed: ${errorMessage}`);
    }
  }

  /**
   * Insert a record into a collection
   * Equivalent to your curl example:
   * curl --location 'http://54.204.140.141:18000/v2/transactions/commit' \
   * --header 'Content-Type: application/json' \
   * --data '{
   *     "id": "INSERT",
   *     "value": {
   *         "collection_name": "users",
   *         "value": {
   *             "id": 13,
   *             "age": 71,
   *             "name": "user_13"
   *         }
   *     }
   * }'
   */
  async insert<T extends Record<string, any>>(
    collectionName: string,
    data: T
  ): Promise<void> {
    console.log("Inserting data:", data);
    return this.commitTransaction("INSERT", collectionName, { value: data });
  }

  /**
   * Create a new collection
   * Equivalent to your curl example:
   * curl --location 'http://54.204.140.141:18000/v2/transactions/commit' \
   * --header 'Content-Type: application/json' \
   * --data '{
   *     "id": "CREATE_COLLECTION",
   *     "value": {
   *         "collection_name": "users",
   *         "options": {
   *             "primary_key": "id",
   *             "secondary_key": "age",
   *             "filter_policy": "leveldb.BuiltinBloomFilter",
   *             "filter_policy_bits_per_key": 20
   *         },
   *         "schema": {
   *             "fields": [
   *                 {"id": "integer"},
   *                 {"age": "integer"},
   *                 {"name": "string"}
   *             ],
   *             "required": ["id", "age"]
   *         }
   *     }
   * }'
   */
  async createCollectionRaw(
    collectionName: string,
    options: CollectionOptions,
    schema: CollectionSchema
  ): Promise<void> {
    const requestValue = {
      options: {
        ...options,
        ...(options.secondary_key ? DEFAULT_COLLECTION_FILTER_OPTIONS : {})
      },
      schema
    };
    return this.commitTransaction("CREATE_COLLECTION", collectionName, requestValue);
  }

  /**
   * Create a new collection with type-safe schema definition
   */
  async createCollection<T extends Record<string, any>>(
    collectionName: string,
    options: CollectionOptions & {
      primary_key: keyof T;
      secondary_key?: keyof T;
    },
    fields: SchemaBuilder<T>,
    requiredFields: (keyof T)[] = []
  ): Promise<void> {
    const schema = createSchemaFromFields<T>(fields, requiredFields);
    return this.createCollectionRaw(collectionName, options, schema);
  }
}

// Export types
export * from '../sdk/src'; 