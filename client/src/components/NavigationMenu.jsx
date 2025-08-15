import CustomNavigationMenu from "./NavigationMenu";

function Navbar() {
  return (
    <div className="flex justify-between items-center p-4 bg-primary text-primary-foreground">
      <div className="text-lg font-bold">My Dashboard</div>
      <CustomNavigationMenu />
    </div>
  );
}

export default Navbar;