import { zodResolver } from "@hookform/resolvers/zod";
import { useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { usePostMeters } from "@/http/generated";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./ui/form";

const formCreatemeterSchema = z.object({
	name: z.string().min(1, "O nome do medidor é requerido"),
	ip: z.string().min(1, "O IP do medidor é requerido"),
	description: z.string().optional(),
});

export function TelemetryForm() {
	const [isOpen, setIsOpen] = useState(false);
	const { queryClient } = useRouteContext({ from: "/_dashboard/telemetria/" });
	const mutation = usePostMeters();
	const form = useForm<z.infer<typeof formCreatemeterSchema>>({
		resolver: zodResolver(formCreatemeterSchema),
		defaultValues: {
			description: "",
			ip: "",
			name: "",
		},
	});

	function onSubmit(data: z.infer<typeof formCreatemeterSchema>) {
		mutation.mutate(
			{ data },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ["Meters"] });
					form.reset();
				},
				onError: () => {},
			},
		);
	}

	return (
		<Dialog>
			<DialogTrigger asChild className="col-span-3">
				<Button variant="outline">Cadastrar Medidor</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Cadastrar medidor</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nome</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="ip"
							render={({ field }) => (
								<FormItem>
									<FormLabel>IP</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Descrição</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline">Cancel</Button>
							</DialogClose>
							<Button type="submit">Save changes</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
