import { Message } from 'node-nats-streaming';
import { Subjects, Listener, CategoryCreatedEvent } from '@hipal/common';
import { Category } from '../../models/category';
import { Dish } from '../../models/dish';
import { queueGroupName } from './queue-group-name';

export class CategoryCreatedConsumer extends Listener<CategoryCreatedEvent> {
  readonly subject = Subjects.CategoryCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: CategoryCreatedEvent['data'], msg: Message) {
    try {
      const {
        name,
        id,
        businessId,
        dishes,
      } = data;
  
      const category = Category.build({
        name,
        id,
        businessId,
      });
  
      for (const dish of dishes) {
        const existingDish = await Dish.findById(dish.id);
        existingDish?.categories.push({
          name,
          id,
        });
        await existingDish?.save();
      }
  
      await category.save();
    } catch (error) {
      console.error(error);
    } finally {
      msg.ack();
    }
  }
}
