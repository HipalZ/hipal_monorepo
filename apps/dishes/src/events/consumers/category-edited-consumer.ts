import { Message } from 'node-nats-streaming';
import { Subjects, Listener, CategoryEditedEvent } from '@hipal/common';
import { Category } from '../../models/category';
import { Dish } from '../../models/dish';
import { queueGroupName } from './queue-group-name';

export class CategoryEditedConsumer extends Listener<CategoryEditedEvent> {
  readonly subject = Subjects.CategoryEdited;
  queueGroupName = queueGroupName;

  async onMessage(data: CategoryEditedEvent['data'], msg: Message) {
    try {
      const {
        id,
        name,
        businessId,
        dishes,
      } = data;
  
      const category = await Category.findById(id);
  
      if (category) {
        const categoryMatch = {
          name: category.name,
          id: category.id,
        };
        const currentDishes = await Dish.find({
          businessId,
          categories: {
            $elemMatch: categoryMatch,
          },
        });
        const updatedDishIds = dishes.map((dish) => { return dish.id });
        const currentDishIds = currentDishes.map((dish) => { return dish.id });
        // Category name is changed
        if (category.name !== name) {
          for (const dish of currentDishes) {
            const index = dish.categories.map((category) => { return category.id }).indexOf(id);
            dish.categories[index] = {
              name,
              id
            };
            await dish.save();
          }
          category.name = name;
          category.businessId = businessId;
          await category.save();
        }
        // New dishes have been added to category
        const newDishIds = updatedDishIds.filter((id) => { return !currentDishIds.includes(id) });
        for (const newDishId of newDishIds) {
          const newDish = await Dish.findById(newDishId);
          newDish?.categories.push({
            id,
            name,
          });
          await newDish?.save();
        }
        // Some dishes were removed from category
        const removedDishIds = currentDishIds.filter((id) => { return !updatedDishIds.includes(id) });
        for (const removedDishId of removedDishIds) {
          const removedDish = await Dish.findById(removedDishId);
          removedDish?.categories.splice(
            removedDish?.categories.map((category) => { return category.id }).indexOf(id), 1
          );
          await removedDish?.save();
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      msg.ack();
    }
  }
}
