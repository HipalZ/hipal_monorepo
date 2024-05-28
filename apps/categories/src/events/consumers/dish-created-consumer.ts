import { Message } from 'node-nats-streaming';
import { Subjects, Listener, DishCreatedEvent } from '@hipal/common';
import { Dish } from '../../models/dish';
import { Category } from '../../models/category';
import { queueGroupName } from './queue-group-name';

export class DishCreatedConsumer extends Listener<DishCreatedEvent> {
  readonly subject = Subjects.DishCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: DishCreatedEvent['data'], msg: Message) {
    try {
      const {
        name,
        id,
        businessId,
        categories
  
      } = data;
  
      const dish = Dish.build({
        name,
        id,
        businessId
  
      });
  
      for (const category of categories) {
        const existingCategory = await Category.findById(category.id);
        existingCategory?.dishes.push({
          name,
          id,
     
        });
        await existingCategory?.save();
      }
  
      await dish.save();
    } catch (error) {
      console.error(error);
    } finally {
      msg.ack();
    }
  }
}
