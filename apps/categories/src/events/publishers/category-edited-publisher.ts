import { Publisher, Subjects, CategoryEditedEvent } from '@hipal/common';

export class CategoryEditedPublisher extends Publisher<CategoryEditedEvent> {
  readonly subject = Subjects.CategoryEdited;
};
