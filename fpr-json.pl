# Perl script to extract contents from file provenance report and spilt into useful JSON
# that are taken in by javascript functions

use strict;
use warnings;
use JSON;
use IO::Uncompress::Gunzip qw($GunzipError);

our @ISA = qw (Exporter);
our @EXPORT_OK;

my ($fpr) = @ARGV;
my %fprData;
my $json;

my $workflowRunSWID;
my $projectSWID;
my $sampleSWID;
my $donorSWID; # root sample
my $sequencerRunSWID;
my $fileSWID;

########################################################################
# Extract data from File Provenance Report
my $line;
my @header;
my %linehash;
my $fprHandle = IO::Uncompress::Gunzip->new( $fpr )
    or die "IO::Uncompress::Gunzip failed: $GunzipError\n";

# Get file provenance report column headings
if ($fprHandle) { 
	$line = $fprHandle->getline();
	chomp $line;
	@header = split /\t/, $line; 
}

# Read data lines of file provenance report
while (!$fprHandle->eof()) {
	$line = $fprHandle->getline();
	chomp $line;
	@linehash{@header} = split("\t", $line);
	
	my $projectName = $linehash{"Study Title"};
	my $date = $linehash{"Last Modified"};
	my $donor = $linehash{"Root Sample Name"};
	my $runName = $linehash{"Sequencer Run Name"};
	my $libraryName = $linehash{"Sample Name"};
	my $workflowName = $linehash{"Workflow Name"};
	my $filePath = $linehash{"File Path"};
	my $runStatus = $linehash{"Workflow Run Status"};
	my $sampleAttributes = $linehash{"Sample Attributes"};
	my $parentAttributes = $linehash{"Parent Sample Attributes"};

	$workflowRunSWID = $linehash{"Workflow Run SWID"};
	$projectSWID = $linehash{"Study SWID"};
	$sequencerRunSWID = $linehash{"Sequencer Run SWID"};
	$fileSWID = $linehash{"File SWID"};
	$sampleSWID = $linehash{"Sample SWID"};
	$donorSWID = $linehash{"Root Sample SWID"};
	

	#By Workflow
	$fprData{"Workflow"}{$workflowRunSWID}{"Last Modified"} = $date;
	unless ( defined $fprData{"Workflow"}{$workflowRunSWID}{"Status"} ){
		$fprData{"Workflow"}{$workflowRunSWID}{"Status"} = $runStatus;
	}
	
	# By Project
	unless ( defined $fprData{"Project"}{$projectSWID}{"Project Name"} ) {
		$fprData{"Project"}{$projectSWID}{"Project Name"} = $projectName;
	}
	unless ( defined $fprData{"Project"}{$projectSWID}{"Start Date"} ) {
		if ($parentAttributes =~ /receive_date.*?=(.*?);/) {
			$fprData{"Project"}{$projectSWID}{"Start Date"} = $1;
		}
	}
	$fprData{"Project"}{$projectSWID}{"Last Modified"} = $date;

	$fprData{"Project"}{$projectSWID}{"Library Name"}{$libraryName} = $date;
	$fprData{"Project"}{$projectSWID}{"Donor Name"}{$donor} = $date;
	$fprData{"Project"}{$projectSWID}{"Workflow Run"}{$workflowRunSWID}{"Workflow Name"} = $workflowName;
	$fprData{"Project"}{$projectSWID}{"Workflow Run"}{$workflowRunSWID}{"Status"} = $runStatus;
	$fprData{"Project"}{$projectSWID}{"Workflow Run"}{$workflowRunSWID}{"Last Modified"} = $date;
	$fprData{"Project"}{$projectSWID}{"Run"}{$sequencerRunSWID}{"Run Name"} = $runName;
	$fprData{"Project"}{$projectSWID}{"Run"}{$sequencerRunSWID}{"Files"}{$fileSWID}++; # = $filePath
	$fprData{"Project"}{$projectSWID}{"Run"}{$sequencerRunSWID}{"Donor Name"}{$donor}++;
	$fprData{"Project"}{$projectSWID}{"Run"}{$sequencerRunSWID}{"Library Name"}{$libraryName}++;
	$fprData{"Project"}{$projectSWID}{"Run"}{$sequencerRunSWID}{"Last Modified"} = $date;
	$fprData{"Project"}{$projectSWID}{"Run"}{$sequencerRunSWID}{"Workflow"}{$workflowRunSWID}{"Workflow Name"} = $workflowName;
	$fprData{"Project"}{$projectSWID}{"Run"}{$sequencerRunSWID}{"Workflow"}{$workflowRunSWID}{"Status"} = $runStatus;
	
	# By Run
	$fprData{"Run"}{$sequencerRunSWID}{"Run Name"} = $runName;
	$fprData{"Run"}{$sequencerRunSWID}{"Library Name"}{$libraryName} = $sampleSWID;
	
	# By Library
	$fprData{"Library"}{$sampleSWID}{"Library Name"} = $libraryName;
	$fprData{"Library"}{$sampleSWID}{"Last Modified"} = $date;
	$fprData{"Library"}{$sampleSWID}{"Workflow Run"}{$workflowRunSWID}{"Workflow Name"} = $workflowName;
	$fprData{"Library"}{$sampleSWID}{"Workflow Run"}{$workflowRunSWID}{"Status"} = $runStatus;
	$fprData{"Library"}{$sampleSWID}{"Workflow Run"}{$workflowRunSWID}{"Skip"} = $linehash{"Skip"};
	$fprData{"Library"}{$sampleSWID}{"Workflow Run"}{$workflowRunSWID}{"Last Modified"} = $date;
	$fprData{"Library"}{$sampleSWID}{"Workflow Run"}{$workflowRunSWID}{"Files"}{$fileSWID} = $filePath;
	$fprData{"Library"}{$sampleSWID}{"Sample Attributes"} = $sampleAttributes;

	# By Donor
	$fprData{"Donor"}{$donorSWID}{"Donor Name"} = $donor;
	$fprData{"Donor"}{$donorSWID}{"Last Modified"} = $date;
	unless ( defined $fprData{"Donor"}{$donorSWID}{"Start Date"} ) {
		$fprData{"Donor"}{$donorSWID}{"Start Date"} = $date;
	}
	if ( $libraryName =~ /.*?_.*?_.*?_(.*?)_.*/ ) {
		$fprData{"Donor"}{$donorSWID}{"Tissue Type"}{$1}{"Library"}{$libraryName}++;
	}
	$fprData{"Donor"}{$donorSWID}{"Donor Attributes"} = $parentAttributes;
	$fprData{"Donor"}{$donorSWID}{"Run"}{$sequencerRunSWID}{"Run Name"} = $runName;
}

my @categories = ("Workflow", "Project", "Run", "Library", "Donor");
my %hash;
foreach my $key (@categories){
	open (FH, ">", "./fpr-".$key.".json");
	$hash{$key} = \%{$fprData{$key}};
	$json = encode_json(\%hash);
	print FH $json;
	delete $hash{$key};
	close (FH);
}