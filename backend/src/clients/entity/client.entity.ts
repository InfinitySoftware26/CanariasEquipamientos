import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ClientStatus } from '../enums/client-status.enum';

@Entity('clients')
export class Client {
  // Identificador único del cliente
  @PrimaryGeneratedColumn('uuid')
  clientId: string;

  // Documento nacional de identidad (único)
  @Column({ unique: true, type: 'bigint' })
  dni: number;

  // URL imagen DNI frente
  @Column({ nullable: true, type: 'varchar' })
  imgDniForehead: string;

  // URL imagen DNI dorso
  @Column({ nullable: true, type: 'varchar' })
  imgDniBack: string;

  // URL imagen servicio
  @Column({ nullable: true, type: 'varchar' })
  imgService: string;

  // Nombre completo del cliente
  @Column({ type: 'varchar', length: 255 })
  name: string;

  // Correo electrónico (único)
  @Column({ unique: true, type: 'varchar' })
  email: string;

  // Teléfono de contacto
  @Column({ nullable: true, type: 'varchar' })
  phone: string;

  // Dirección del cliente
  @Column({ nullable: true, type: 'varchar' })
  address: string;

  // Fecha de nacimiento
  @Column({ nullable: true, type: 'date' })
  birthday: Date;

  // Zona geográfica del cliente (FK)
  @Column({ type: 'uuid', nullable: true })
  zoneId: string;

  // Cobrador responsable (FK a STAFF)
  @Column({ type: 'uuid', nullable: true })
  staffId: string;

  // Sociedad a la que pertenece (FK)
  @Column({ type: 'uuid', nullable: true })
  societyId: string;

  // Estado del cliente
  @Column({ type: 'enum', enum: ClientStatus, default: ClientStatus.ACTIVE })
  status: ClientStatus;

  // Fecha de creación del registro
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  // Última actualización del registro
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
