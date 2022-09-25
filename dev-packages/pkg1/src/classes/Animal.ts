import { IAnimal }         from "../interfaces/IAnimal";
import { IPhysProperties } from "../interfaces/IPhysProperties";

export class Animal implements IAnimal, IPhysProperties
{
	height!: number;
	weight!: number;
}