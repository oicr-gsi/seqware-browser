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
my $IUSSWID;
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
	my $donorName = $linehash{"Root Sample Name"};
	my $runName = $linehash{"Sequencer Run Name"};
	my $libraryName = $linehash{"Sample Name"};
	my $workflowName = $linehash{"Workflow Name"};
	my $filePath = $linehash{"File Path"};
	my $runStatus = $linehash{"Workflow Run Status"};
	my $sampleAttributes = $linehash{"Sample Attributes"};
	my $parentAttributes = $linehash{"Parent Sample Attributes"};
	my $lane = $linehash{"Lane Number"};
	my $barcode = $linehash{"IUS Tag"};

	$workflowRunSWID = $linehash{"Workflow Run SWID"};
	$projectSWID = $linehash{"Study SWID"};
	$sequencerRunSWID = $linehash{"Sequencer Run SWID"};
	$fileSWID = $linehash{"File SWID"};
	$IUSSWID = $linehash{"IUS SWID"};
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

	$fprData{"Project"}{$projectSWID}{"Last Modified"} = $date;

	$fprData{"Project"}{$projectSWID}{"Library"}{$IUSSWID} = $libraryName;
	$fprData{"Project"}{$projectSWID}{"Donor"}{$donorSWID} = $donorName;
	$fprData{"Project"}{$projectSWID}{"Workflow Run"}{$workflowRunSWID}{"Workflow Name"} = $workflowName;
	$fprData{"Project"}{$projectSWID}{"Workflow Run"}{$workflowRunSWID}{"Status"} = $runStatus;
	$fprData{"Project"}{$projectSWID}{"Workflow Run"}{$workflowRunSWID}{"Last Modified"} = $date;
	$fprData{"Project"}{$projectSWID}{"Run"}{$sequencerRunSWID}{"Run Name"} = $runName;
	$fprData{"Project"}{$projectSWID}{"Run"}{$sequencerRunSWID}{"Donor Name"}{$donorName}++;
	$fprData{"Project"}{$projectSWID}{"Run"}{$sequencerRunSWID}{"Workflow"}{$workflowRunSWID}{"Workflow Name"} = $workflowName;
	$fprData{"Project"}{$projectSWID}{"Run"}{$sequencerRunSWID}{"Workflow"}{$workflowRunSWID}{"Status"} = $runStatus;
	
	# By Run
	$fprData{"Run"}{$sequencerRunSWID}{"Run Name"} = $runName;
	$fprData{"Run"}{$sequencerRunSWID}{"Library"}{$IUSSWID}{"Library Name"} = $libraryName;
	$fprData{"Run"}{$sequencerRunSWID}{"Lane"}{$lane}{"Library"}{$IUSSWID}{"Library Name"} = $libraryName;
	$fprData{"Run"}{$sequencerRunSWID}{"Lane"}{$lane}{"Library"}{$IUSSWID}{"Barcode"} = $barcode;

	# By Library
	$fprData{"Library"}{$IUSSWID}{"Library Name"} = $libraryName;
	$fprData{"Library"}{$IUSSWID}{"Last Modified"} = $date;
	$fprData{"Library"}{$IUSSWID}{"Barcode"} = $barcode;
	$fprData{"Library"}{$IUSSWID}{"Lane"} = $lane;
	$fprData{"Library"}{$IUSSWID}{"Run"}{$sequencerRunSWID} = $runName;
	$fprData{"Library"}{$IUSSWID}{"Workflow Run"}{$workflowRunSWID}{"Workflow Name"} = $workflowName;
	$fprData{"Library"}{$IUSSWID}{"Workflow Run"}{$workflowRunSWID}{"Status"} = $runStatus;
	$fprData{"Library"}{$IUSSWID}{"Workflow Run"}{$workflowRunSWID}{"Skip"} = $linehash{"Skip"};
	$fprData{"Library"}{$IUSSWID}{"Workflow Run"}{$workflowRunSWID}{"Last Modified"} = $date;
	$fprData{"Library"}{$IUSSWID}{"Workflow Run"}{$workflowRunSWID}{"Files"}{$fileSWID} = $filePath;
	$fprData{"Library"}{$IUSSWID}{"Sample Attributes"} = $sampleAttributes;

	if ($filePath =~ /.*.BamQC.json$/ ) {
        $fprData{"Library"}{$IUSSWID}{"JSON"} = $filePath;
    } elsif ($filePath =~ /.*.log$/ and $workflowName eq ("Xenome")){
   		$fprData{"Library"}{$IUSSWID}{"XenomeFile"} = $filePath;
   	} elsif ($filePath =~ /.*rnaqc.report.zip$/){
   		$fprData{"Library"}{$IUSSWID}{"RNAZipFile"} = $filePath;
   	}

	# By Donor
	$fprData{"Donor"}{$donorSWID}{"Donor Name"} = $donorName;
	$fprData{"Donor"}{$donorSWID}{"Last Modified"} = $date;
	$fprData{"Donor"}{$donorSWID}{"Donor Attributes"} = $parentAttributes;
	$fprData{"Donor"}{$donorSWID}{"Run"}{$sequencerRunSWID}{"Run Name"} = $runName;
	$fprData{"Donor"}{$donorSWID}{"Library"}{$IUSSWID}{"Library Name"} = $libraryName;
	
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