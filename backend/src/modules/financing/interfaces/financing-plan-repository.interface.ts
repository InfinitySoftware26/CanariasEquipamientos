import { FinancingPlan } from '../entities/financing-plan.entity';
import { CreateFinancingPlanDto } from '../dto/create-financing-plan.dto';
import { UpdateFinancingPlanDto } from '../dto/update-financing-plan.dto';

/**
 * IFinancingPlanRepository
 *
 * Define las operaciones de acceso a datos para FinancingPlan.
 * Todos los métodos requieren y validan societyId para garantizar aislamiento multi-sociedad.
 */
export interface IFinancingPlanRepository {
    create(
        societyId: string,
        dto: CreateFinancingPlanDto,
    ): Promise<FinancingPlan>;

    findAllBySociety(societyId: string): Promise<FinancingPlan[]>;

    findById(
        societyId: string,
        financingPlanId: string,
    ): Promise<FinancingPlan | null>;

    update(
        societyId: string,
        financingPlanId: string,
        dto: UpdateFinancingPlanDto,
    ): Promise<FinancingPlan>;

    delete(societyId: string, financingPlanId: string): Promise<void>;
}

export const FINANCING_PLAN_REPOSITORY = 'IFinancingPlanRepository';
