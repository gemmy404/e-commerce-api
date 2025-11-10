import {Injectable} from "@nestjs/common";
import {CategoryResponseDto} from "./dto/category-response.dto";

@Injectable()
export class CategoriesMapper {

    toCategoriesResponse(category: any): CategoryResponseDto {
        return {
            id: category._id,
            name: category.name,
        };
    }

}