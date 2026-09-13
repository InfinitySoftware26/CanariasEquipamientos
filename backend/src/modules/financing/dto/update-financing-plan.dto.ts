import { PartialType } from "@nestjs/swagger";
import { CreateFinancingPlanDto } from "./create-financing-plan.dto";

export class UpdateFinancingPlanDto extends PartialType(
  CreateFinancingPlanDto,
) {}
