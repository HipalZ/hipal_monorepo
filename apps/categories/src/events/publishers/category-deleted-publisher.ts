import { Publisher, Subjects, CategoryDeletedEvent } from '@hipal/common';

export class CategoryDeletedPublisher extends Publisher<CategoryDeletedEvent> {
  readonly subject = Subjects.CategoryDeleted;
};
