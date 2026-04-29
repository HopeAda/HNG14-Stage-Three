"use client";
import { Habit } from "@/types/habit";
import HabitCard from "./HabitCard";

type ListProviderProps = {
	habitList: Habit[];
};
export default function HabitList({ habitList }: ListProviderProps) {
	return (
		<div className="w-full flex flex-col gap-4! md:grid md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] md:grid-rows-auto">
			{habitList.map((itm) => (
				<HabitCard habit={itm} key={itm.id} />
			))}
		</div>
	);
}
