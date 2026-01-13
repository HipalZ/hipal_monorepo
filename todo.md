1. go to servers/categories/src/route/create-categories

2. go to this endPoint ="/v1/categories"
///
3. line no-34 :
   Argument of type '(session: ClientSession) => Promise<express.Response<any, Record<string, any>>>' is not assignable to parameter of type 'TransactionCallback'.
   Type 'Promise<Response<any, Record<string, any>>>' is not assignable to type 'Promise<void>'.
   Type 'Response<any, Record<string, any>>' is not assignable to type 'void'

4. line no- 58
   Property '\_id' does not exist on type '{ businessId: string; name: string; visibility: boolean; availability: boolean; price: number; dishType: string; kitchenId: string; filters: { dishes: string[]; timeToConsume: number; portionBestSuited: string; ... 5 more ...; metaTag: string[]; }

//////////////////////////////

go to servers/categories/src/route/update-categories

go to this endPoint "/v1/categories/:id"

line no-18:
Overload 1 of 4, '(id: any, update: UpdateQuery<{ businessId: string; name: string; visibility: boolean; timerOn: boolean; availableDays: number[]; hierarchy: "PARENT" | "CHILD"; links: string[]; dishes: string[]; version: number; ... 6 more ...; coverImage?: string | undefined; }>, options: QueryOptions<...> & { ...; }, callback?: ((err: CallbackError, doc: any, res: any) => void) | undefined): Query<...>', gave the following error.
