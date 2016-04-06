#!/bin/bash

source "/oicr/cluster/etc/profile"

cd /u/mcheng/browsertest

unset PERL5LIB

qsub -cwd -b y -N CurrentWorkflows -e error.log -o output.log -l h_vmem=8g "/u/mcheng/browsertest/node-v5.7.0-linux-x64/bin/node --max_old_space_size=8192 seqware-db-current-wfs.js workflowRuns.yml"
