import { Publisher, Subjects, CategoryCreatedEvent } from '@hipal/common';

export class CategoryCreatedPublisher extends Publisher<CategoryCreatedEvent> {
  readonly subject = Subjects.CategoryCreated;
};
