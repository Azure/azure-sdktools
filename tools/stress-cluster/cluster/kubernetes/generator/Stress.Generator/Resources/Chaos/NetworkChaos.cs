using System;

/*
apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos
metadata:
  name: "{{ .Release.Name }}-{{ .Release.Revision }}"
  namespace: {{ .Release.Namespace }}
spec:
  action: loss
  direction: to
  externalTargets:
    - bing.com
  mode: one
  selector:
    labelSelectors:
      testInstance: "packet-loss-{{ .Release.Name }}-{{ .Release.Revision }}"
      chaos: "true"
    namespaces:
      - {{ .Release.Namespace }}
  loss:
    loss: "100"
    correlation: "100"
*/

namespace Stress.Generator
{
    public class NetworkChaos : Resource
    {
        [OptionalResourceProperty("Action: loss, delay, netem, duplicate, corrupt, partition, bandwidth", "loss")]
        public string Action;

        [ResourceProperty("External Targets, e.g. servicebus.windows.net")]
        public string ExternalTargets;

        public NetworkChaos() : base()
        {
            
        }
    }
}
