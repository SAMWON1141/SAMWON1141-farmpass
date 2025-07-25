import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { BUTTONS, LABELS } from "@/lib/constants/farms";

interface EmptyFarmsStateProps {
  onAddClick: () => void;
}

export function EmptyFarmsState({ onAddClick }: EmptyFarmsStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {LABELS.NO_REGISTERED_FARMS}
              </h3>
              <p className="text-muted-foreground">
                {LABELS.NO_FARMS_DESCRIPTION}
              </p>
            </div>
            <Button onClick={onAddClick}>
              <Plus className="mr-2 h-4 w-4" />
              {BUTTONS.ADD_FIRST_FARM}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
