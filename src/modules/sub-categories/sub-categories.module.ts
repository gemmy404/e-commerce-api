import {Module} from '@nestjs/common';
import {SubCategoriesService} from './sub-categories.service';
import {SubCategoriesController} from './sub-categories.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {SubCategory, SubCategorySchema} from "./schemas/sub-category.schema";
import {CategoriesModule} from "../categories/categories.module";
import {SubCategoriesMapper} from "./sub-categories.mapper";
import {Category, CategorySchema} from "../categories/schemas/category.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: SubCategory.name, schema: SubCategorySchema},
            {name: Category.name, schema: CategorySchema},
        ]),
        CategoriesModule,
    ],
    controllers: [SubCategoriesController],
    providers: [SubCategoriesService, SubCategoriesMapper],
    exports: [SubCategoriesService],
})
export class SubCategoriesModule {
}
