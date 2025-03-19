import { Heart } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t py-6 md:py-0" data-oid="jiiyf14">
      <div
        className="container flex flex-col md:flex-row items-center justify-between gap-4 md:h-16"
        data-oid="0z0:-g5"
      >
        <p className="text-sm text-muted-foreground" data-oid="7ecqsc_">
          © {year} RowQuest. All rights reserved.
        </p>
        <div
          className="flex items-center gap-1 text-sm text-muted-foreground"
          data-oid="f8p1om0"
        >
          <span data-oid="g17fr1w">Made with</span>
          <Heart
            className="h-4 w-4 fill-energy-500 text-energy-500"
            data-oid="gkvoi6:"
          />

          <span data-oid="bvodflh">for rowers</span>
        </div>
      </div>
    </footer>
  );
}
