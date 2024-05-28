import { Publisher, Subjects, DishCreatedEvent } from '@hipal/common';

export class DishCreatedPublisher extends Publisher<DishCreatedEvent> {
  readonly subject = Subjects.DishCreated;
};
