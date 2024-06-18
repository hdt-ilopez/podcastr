import { GeneratePodcastProps } from '@/types';
import { Label } from '@radix-ui/react-label';
import React, { useState } from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Loader } from 'lucide-react';
import { useAction, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { v4 as uuidv4 } from 'uuid';
import { generateUploadUrl } from '@/convex/files';
import { useToast } from './ui/use-toast';

import { useUploadFiles } from '@xixixao/uploadstuff/react';

const useGeneratePodcast = ({
  setAudio,
  voiceType,
  voicePrompt,
  setAudioStorageId,
}: GeneratePodcastProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const { toast } = useToast();
  const getPodcastAudio = useAction(api.openai.generateAudioAction);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const getAudioUrl = useMutation(api.podcasts.getUrl);
  const { startUpload } = useUploadFiles(generateUploadUrl);

  const generatePodcast = async () => {
    setIsGenerating(true);
    setAudio('');

    if (!voicePrompt) {
      toast({
        title: 'Please provide a voice type to generate a podcast',
      });
      return setIsGenerating(false);
    }

    try {
      const response = await getPodcastAudio({
        voice: voiceType,
        input: voicePrompt,
      });

      const blob = new Blob([response], { type: 'audio/mpeg' });
      const fileName = `podcast-${uuidv4()}.mp3`;
      const file = new File([blob], fileName, { type: 'audio/mpeg' });

      const uploaded = await startUpload([file]);
      const storageId = (uploaded[0].response as any).storageId;

      setAudioStorageId(storageId);

      const audioUrl = await getAudioUrl({ storageId });
      setAudio(audioUrl!);
      setIsGenerating(false);
      toast({
        title: 'Podcast generated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error creating podcast',
        variant: 'destructive',
      });
      console.log('Error generating podcast', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generatePodcast,
  };
};

const GeneratePodcast = (props: GeneratePodcastProps) => {
  const { isGenerating, generatePodcast } = useGeneratePodcast(props);

  return (
    <div>
      <div className="flex flex-col gap-2.5">
        <Label className="text-16 font-bold text-white-1">
          AI Prompt to generate Podcast
        </Label>
        <Textarea
          className="input-class font-light focus-visible:ring-offset-orange-1"
          placeholder="Provide text to generate audio"
          rows={5}
          value={props.voicePrompt}
          onChange={(e) => props.setVoicePrompt(e.target.value)}
        />
      </div>
      <div className="mt-5 w-full max-w-[200px]">
        <div className="mt-10 w-full ">
          <Button
            type="submit"
            disabled={isGenerating}
            onClick={generatePodcast}
            className="text-16 bg-orange-1 font-bold text-white-1 hover:bg-orange-2 disabled:bg-gray-1"
          >
            {isGenerating ? (
              <>
                Generating
                <Loader size={20} className="animate-spin ml-2" />
              </>
            ) : (
              `Generate`
            )}
          </Button>
        </div>
        {props.audio && (
          <audio
            controls
            src={props.audio}
            autoPlay
            className="mt-5"
            onLoadedMetadata={(e) =>
              props.setAudioDuration(e.currentTarget.duration)
            }
          />
        )}
      </div>
    </div>
  );
};

export default GeneratePodcast;
