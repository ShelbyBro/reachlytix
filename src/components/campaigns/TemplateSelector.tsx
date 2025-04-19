
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { campaignTemplates } from "@/utils/campaign-templates";
import { Button } from "@/components/ui/button";

interface TemplateSelectorProps {
  messageType: "email" | "sms" | "whatsapp";
  onTemplateSelect: (template: any) => void;
}

export function TemplateSelector({ messageType, onTemplateSelect }: TemplateSelectorProps) {
  const templates = campaignTemplates.filter(template => template.type === messageType);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Choose a Template</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {templates.map((template) => (
          <Card 
            key={template.id}
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => onTemplateSelect(template)}
          >
            <CardHeader>
              <CardTitle className="text-sm">{template.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">
                {template.content.substring(0, 100)}...
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onTemplateSelect(template);
                }}
              >
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
