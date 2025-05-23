import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  FileText, 
  Home, 
  Activity, 
  Settings,
  Download
} from "lucide-react";

function Navbar() {
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Kham River Monitor</span>
          </Link>

          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Home
                  </Button>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Monitoring</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 w-[400px]">
                    <Link to="/water-quality">
                      <NavigationMenuLink className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                        <Activity className="h-4 w-4" />
                        Water Quality Data
                      </NavigationMenuLink>
                    </Link>
                    <Link to="/real-time">
                      <NavigationMenuLink className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                        <Settings className="h-4 w-4" />
                        Real-time Monitoring
                      </NavigationMenuLink>
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Analysis</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 w-[400px]">
                    <Link to="/predictions">
                      <NavigationMenuLink className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
                        <BarChart className="h-4 w-4" />
                        Data Analysis
                      </NavigationMenuLink>
                    </Link>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 w-full justify-start"
                      onClick={() => window.location.href="/quality-report.pdf"}
                    >
                      <Download className="h-4 w-4" />
                      Download Report
                    </Button>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  window.location.href = "/login";
                }}
              >
                Logout
              </Button>
            ) : (
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;