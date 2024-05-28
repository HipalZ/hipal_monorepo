import { Publisher, Subjects, DishDeletedEvent } from '@hipal/common';

export class DishDeletedPublisher extends Publisher<DishDeletedEvent> {
  readonly subject = Subjects.DishDeleted;
};
