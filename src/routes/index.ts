import { Router } from 'express';
import userRoutes from '@/users/routes/users.routes';
import authRoutes from '@/users/routes/auth.routes';
import roleRoutes from '@/roles/routes/roles.routes';
import permissionRoutes from '@/roles/routes/permissions.routes';
import rolePermissionRoutes from '@/roles/routes/rolepermissions.routes';
import shiftRoutes from '@/shifts/routes/shifts.routes';
import shiftCalendarRoutes from '@/shifts/routes/shift-calendar.routes';
import shiftRotationRuleRoutes from '@/shifts/routes/shiftrotationrules.routes';
import shiftRotationRuleShiftRoutes from '@/shifts/routes/shiftrotationruleshifts.routes';
import pharmacyRoutes from '@/pharmacies/routes/pharmacys.routes';
import orderRoutes from '@/orders/routes/orders.routes';
import orderItemRoutes from '@/orders/routes/orderitems.routes';
import customerRoutes from '@/customers/routes/customers.routes';
import personRoutes from '@/customers/routes/persons.routes';
import insurancePlanRoutes from '@/customers/routes/insuranceplans.routes';
import medicalInsuranceRoutes from '@/customers/routes/medicalinsurances.routes';
import productRoutes from '@/products/routes/products.routes';
import categoryRoutes from '@/products/routes/categorys.routes';
import laboratoryRoutes from '@/products/routes/laboratorys.routes';
import favouritePharmacyRoutes from '@/users/routes/favouritepharmacys.routes';

const router = Router();

// Rutas principales
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// Domain Routes
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/rolepermissions', rolePermissionRoutes);
router.use('/shifts/calendar', shiftCalendarRoutes);
router.use('/shifts', shiftRoutes);
router.use('/shiftrotationrules', shiftRotationRuleRoutes);
router.use('/shiftrotationruleshifts', shiftRotationRuleShiftRoutes);
router.use('/pharmacys', pharmacyRoutes);
router.use('/orders', orderRoutes);
router.use('/orderitems', orderItemRoutes);
router.use('/customers', customerRoutes);
router.use('/persons', personRoutes);
router.use('/insuranceplans', insurancePlanRoutes);
router.use('/medicalinsurances', medicalInsuranceRoutes);
router.use('/products', productRoutes);
router.use('/categorys', categoryRoutes);
router.use('/laboratorys', laboratoryRoutes);
router.use('/favouritepharmacys', favouritePharmacyRoutes);

export default router;
