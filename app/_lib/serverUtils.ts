import type {
    AnyBulkWriteOperation,
    ClientBulkWriteModel,
    Collection,
    Document,
    Filter,
    UpdateFilter,
} from "mongodb";

export function ut<Doc extends Document>() {
    type F = Filter<Doc>;
    type UF = UpdateFilter<Doc>;
    return {
        // for simple collection operations

        filter: (): F => ({}),
        partial: (): Partial<Doc> => ({}),
        updateFilter: (): UF => ({}),
        findOne: (col: Collection<Doc>, f: F) => col.findOne(f),

        // for pipeline stages

        match: <Doc>(matchInput: Filter<Doc>) => ({ $match: matchInput }),

        // for Collection.bulkWrite
        anyBulkWriteOperations: <
            Doc extends Document,
        >(): AnyBulkWriteOperation<Doc>[] => [],

        // for MongoClient.bulkWrite
        clientBulkWriteModels: (): ClientBulkWriteModel[] => [],
    };
}
