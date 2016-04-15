#!/bin/bash
set -eu

. ${CRON_ROOT}/functions

reenter skip

source "/oicr/cluster/etc/profile"

dir="$(sqwwhich seqware-browser-repo)"
node="$(sqwwhich seqware-browser-node)"
analysis_yaml="$(sqwwhich seqware-browser-analysis-yaml)"
config_path="$(sqwwhich seqware-browser-config)"

cd $dir

## Workflows
qsub -cwd -b y -N CurrentWorkflows -e error.log -o output.log -l h_vmem=8g "export NODE_PATH=$NODE_PATH:$config_path; $node --max_old_space_size=8192 ./scripts/seqware-db-current-wfs.js $analysis_yaml"

## Runs
qsub -cwd -b y -N RunInfo -e error.log -o output.log -l h_vmem=8g "curl -k https://pinery.hpc.oicr.on.ca:8443/pinery/sequencerruns -o ./pinery/runs.out; export NODE_PATH=$NODE_PATH:$config_path; $node --max_old_space_size=8192 ./scripts/pinery-data-run.js ./pinery/runs.out"
