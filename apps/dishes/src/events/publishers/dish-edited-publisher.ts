import { Publisher, Subjects, DishEditedEvent } from '@hipal/common';

export class DishEditedPublisher extends Publisher<DishEditedEvent> {
  readonly subject = Subjects.DishEdited;
};
