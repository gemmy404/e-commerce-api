import {Injectable} from "@nestjs/common";
import {SubCategoryResponseDto} from "./dto/sub-category-response.dto";
import {SubCategory} from "./schemas/sub-category.schema";

@Injectable()
export class SubCategoriesMapper {

    toSubCategoriesResponse(subCategory: any): SubCategoryResponseDto {
        return {
            id: subCategory._id,
            name: subCategory.name,
            category: subCategory.category.name,
        };
    }

    toSubCategoriesSchema(subCategoryRequest: any): SubCategory {
        return {
            name: subCategoryRequest.name,
            category: subCategoryRequest.categoryId,
        };
    }

}