import { naturePrompt, naturePromptOutputGuidelines } from './prompt/p1-nature';
import { closedReasonPrompt, closedReasonPromptOutputGuidelines } from './prompt/p2-closed-reason';
import {
  changesQualityPrompt,
  changesQualityPromptOutputGuidelines,
} from './prompt/p3-changes-quality';
import {
  descriptionQualityPrompt,
  descriptionQualityPromptOutputGuidelines,
} from './prompt/p4-description-quality';
import { changesNecessityPrompt, changesNecessityPromptOutputGuidelines } from './prompt/p5-changes-necessity';

// prompt template field in Tasks
export enum PromptTemplateEnum {
  Nature = 'nature',
  ClosedReason = 'closedReason',
  ChangesQuality = 'changesQuality',
  DescriptionQuality = 'descriptionQuality',
  ChangesNecessity = 'changesNecessity',
}

export const promptTemplates = {
  [PromptTemplateEnum.Nature]: naturePrompt,
  [PromptTemplateEnum.ClosedReason]: closedReasonPrompt,
  [PromptTemplateEnum.ChangesQuality]: changesQualityPrompt,
  [PromptTemplateEnum.DescriptionQuality]: descriptionQualityPrompt,
  [PromptTemplateEnum.ChangesNecessity]: changesNecessityPrompt,
} as const;

export const promptOutputGuidelines = {
  [PromptTemplateEnum.Nature]: naturePromptOutputGuidelines,
  [PromptTemplateEnum.ClosedReason]: closedReasonPromptOutputGuidelines,
  [PromptTemplateEnum.ChangesQuality]: changesQualityPromptOutputGuidelines,
  [PromptTemplateEnum.DescriptionQuality]: descriptionQualityPromptOutputGuidelines,
  [PromptTemplateEnum.ChangesNecessity]: changesNecessityPromptOutputGuidelines,
} as const;
