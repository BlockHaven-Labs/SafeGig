import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <div>DropdownMenu</div>;
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return <div>DropdownMenuTrigger</div>;
}

function DropdownMenuContent({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return <div>DropdownMenuContent</div>;
}

function DropdownMenuItem({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item>) {
  return <div>DropdownMenuItem</div>;
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
};
