import { Message } from 'node-nats-streaming';
import { Subjects, Listener, CategoryDeletedEvent } from '@hipal/common';
import { Category } from '../../models/category';
import { Dish } from '../../models/dish';
import { queueGroupName } from './queue-group-name';

export class CategoryDeletedConsumer extends Listener<CategoryDeletedEvent> {
  readonly subject = Subjects.CategoryDeleted;
  queueGroupName = queueGroupName;

  async onMessage(data: CategoryDeletedEvent['data'], msg: Message) {
    try {
      const {
        id
      } = data;
  
      const category = await Category.findById(id);
  
      if (category) {
        const categoryMatch = {
          name: category.name,
          id: category.id,
        };
        const dishes = await Dish.find({
          categories: {
            $elemMatch: categoryMatch,
          },
        })
        for (const dish of dishes) {
          dish.categories.splice(
            dish.categories.map((category) => { return category.id }).indexOf(id), 1
          );
          await dish.save();
        }
        await Category.findByIdAndDelete(id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      msg.ack();
    }
  }
}
